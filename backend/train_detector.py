"""
SmartScan — Train Math Expression Detection Model (Faster R-CNN)
================================================================
Downloads the IBEM dataset and fine-tunes a Faster R-CNN (ResNet50+FPN)
for detecting mathematical expressions in book pages.

Optimized for: RTX 3060 6GB VRAM + 32GB RAM
Expected training time: ~2-3 hours on 10% data

Usage:
    cd E:\\PROJECT\\SmartScan\\dl-processing-engine
    python train_detector.py
"""

import json
import os
import sys
import time

import numpy as np
import torch
import torchvision
from PIL import Image
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms as T
from torchvision.models.detection import (
    FasterRCNN_ResNet50_FPN_V2_Weights,
    fasterrcnn_resnet50_fpn_v2,
)
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
from tqdm import tqdm

# Add parent directory to path for config import
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import (
    BATCH_SIZE_DETECTION,
    DEVICE,
    IBEM_DATASET_DIR,
    LEARNING_RATE,
    MODELS_DIR,
    NUM_EPOCHS_DETECTION,
    NUM_WORKERS,
    ensure_dirs,
)

ensure_dirs()

# ============================================================
# CONFIGURATION
# ============================================================
NUM_CLASSES = 2  # background + math_expression
SUBSET_FRACTION = 0.10  # Use 10% of dataset
SAVE_PATH = os.path.join(MODELS_DIR, "fasterrcnn_math_detector.pt")

print("=" * 60)
print("🧠 SmartScan — Faster R-CNN Math Expression Detector")
print(f"   Device: {DEVICE}")
print(f"   Epochs: {NUM_EPOCHS_DETECTION}")
print(f"   Batch Size: {BATCH_SIZE_DETECTION}")
print(f"   Subset: {int(SUBSET_FRACTION * 100)}%")
print("=" * 60)

device = torch.device(DEVICE if torch.cuda.is_available() else "cpu")
if torch.cuda.is_available():
    print(f"   GPU: {torch.cuda.get_device_name(0)}")
    print(f"   VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")


# ============================================================
# STEP 1: Check Dataset
# ============================================================
print("\n" + "=" * 60)
print("📥 STEP 1: Checking IBEM dataset...")
print("=" * 60)

IBEM_IMAGES_DIR = os.path.join(IBEM_DATASET_DIR, "images")
IBEM_ANNOTATIONS_DIR = os.path.join(IBEM_DATASET_DIR, "annotations")

if not os.path.exists(IBEM_IMAGES_DIR):
    print(
        f"""
[⚠️] IBEM dataset not found at: {IBEM_DATASET_DIR}

Please download it manually:
    1. Go to: https://zenodo.org/records/4757865
    2. Download the dataset archive
  3. Extract to: {IBEM_DATASET_DIR}
  4. Ensure structure:
     {IBEM_DATASET_DIR}/
       images/       (PNG/JPG files)
       annotations/  (XML/JSON annotation files)
  5. Re-run this script

Alternative: You can also use YOLOv8 for detection (simpler).
  See: https://docs.ultralytics.com/tasks/detect/
"""
    )
    # --- Fallback: Use YOLOv8 with pre-trained model ---
    print("=" * 60)
    print("🔄 FALLBACK: Training YOLOv8 instead (simpler approach)...")
    print("=" * 60)
    print(
        """
To train YOLOv8 on your own data:

1. Prepare your data in YOLO format:
   datasets/ibem/
     images/train/  images/val/
     labels/train/  labels/val/

2. Create a data.yaml:
   path: E:/PROJECT/SmartScan/datasets/ibem
   train: images/train
   val: images/val
   names:
     0: math_expression

3. Run:
   from ultralytics import YOLO
   model = YOLO("yolov8n.pt")
   model.train(data="datasets/ibem/data.yaml", epochs=50, batch=8, imgsz=640)

For now, you can use a pre-trained YOLOv8 model for detection.
The existing `best.pt` file (if you have it) works with the pipeline.
"""
    )
    sys.exit(0)


# ============================================================
# STEP 2: Custom Dataset Class
# ============================================================
print("\n" + "=" * 60)
print("📦 STEP 2: Preparing dataset...")
print("=" * 60)


class IBEMDataset(Dataset):
    """IBEM dataset for math expression detection."""

    def __init__(
        self, images_dir, annotations_dir, transforms=None, subset_fraction=1.0
    ):
        self.images_dir = images_dir
        self.annotations_dir = annotations_dir
        self.transforms = transforms

        # Get all image files
        self.image_files = sorted(
            [
                f
                for f in os.listdir(images_dir)
                if f.lower().endswith((".png", ".jpg", ".jpeg"))
            ]
        )

        # Take subset
        if subset_fraction < 1.0:
            np.random.seed(42)
            n = int(len(self.image_files) * subset_fraction)
            indices = np.random.choice(len(self.image_files), n, replace=False)
            self.image_files = [self.image_files[i] for i in sorted(indices)]

        print(f"  Dataset size: {len(self.image_files)} images")

    def __len__(self):
        return len(self.image_files)

    def __getitem__(self, idx):
        img_name = self.image_files[idx]
        img_path = os.path.join(self.images_dir, img_name)

        # Load image
        image = Image.open(img_path).convert("RGB")
        img_w, img_h = image.size

        # Load annotation (try JSON, XML, then IBEM TXT)
        ann_name = os.path.splitext(img_name)[0]
        boxes, labels = self._load_annotation(ann_name, img_w, img_h)

        # If no annotations found, create empty
        if len(boxes) == 0:
            boxes = torch.zeros((0, 4), dtype=torch.float32)
            labels = torch.zeros((0,), dtype=torch.int64)
        else:
            boxes = torch.tensor(boxes, dtype=torch.float32)
            labels = torch.tensor(labels, dtype=torch.int64)

        target = {
            "boxes": boxes,
            "labels": labels,
            "image_id": torch.tensor([idx]),
        }

        if self.transforms:
            image = self.transforms(image)

        return image, target

    def _load_annotation(self, ann_name, img_w, img_h):
        """Try to load annotation from JSON, XML, or IBEM TXT format."""
        boxes = []
        labels = []

        # Try JSON
        json_path = os.path.join(self.annotations_dir, ann_name + ".json")
        if os.path.exists(json_path):
            with open(json_path, "r", encoding="utf-8") as f:
                ann = json.load(f)
            for obj in ann.get("objects", ann.get("annotations", [])):
                if "bbox" in obj:
                    bbox = obj["bbox"]
                    # Convert [x, y, w, h] to [x1, y1, x2, y2] if needed
                    if len(bbox) == 4:
                        x, y, w, h = bbox
                        boxes.append([x, y, x + w, y + h])
                        labels.append(1)  # 1 = math_expression
            return boxes, labels

        # Try XML (Pascal VOC format)
        xml_path = os.path.join(self.annotations_dir, ann_name + ".xml")
        if os.path.exists(xml_path):
            import xml.etree.ElementTree as ET

            tree = ET.parse(xml_path)
            root = tree.getroot()
            for obj in root.findall("object"):
                bndbox = obj.find("bndbox")
                if bndbox is not None:
                    x1 = float(bndbox.find("xmin").text)
                    y1 = float(bndbox.find("ymin").text)
                    x2 = float(bndbox.find("xmax").text)
                    y2 = float(bndbox.find("ymax").text)
                    boxes.append([x1, y1, x2, y2])
                    labels.append(1)
            return boxes, labels

        # Try TXT (IBEM format: x_rel y_rel width height class; values are percentages)
        txt_path = self._resolve_txt_annotation_path(ann_name)
        if txt_path and os.path.exists(txt_path):
            with open(txt_path, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue

                    parts = line.split()
                    if len(parts) < 5:
                        continue

                    try:
                        x_rel = float(parts[0])
                        y_rel = float(parts[1])
                        w_rel = float(parts[2])
                        h_rel = float(parts[3])
                    except ValueError:
                        continue

                    x1 = (x_rel / 100.0) * img_w
                    y1 = (y_rel / 100.0) * img_h
                    x2 = x1 + (w_rel / 100.0) * img_w
                    y2 = y1 + (h_rel / 100.0) * img_h

                    x1 = max(0.0, min(x1, img_w - 1.0))
                    y1 = max(0.0, min(y1, img_h - 1.0))
                    x2 = max(0.0, min(x2, img_w - 1.0))
                    y2 = max(0.0, min(y2, img_h - 1.0))

                    # Keep only valid boxes with non-zero area.
                    if x2 > x1 and y2 > y1:
                        boxes.append([x1, y1, x2, y2])
                        labels.append(1)

            return boxes, labels

        return boxes, labels

    def _resolve_txt_annotation_path(self, ann_name):
        """Resolve IBEM TXT filename variants for a given image stem."""
        candidates = [
            ann_name + ".txt",
            ann_name.replace("-page", "-color_page") + ".txt",
        ]

        for candidate in candidates:
            path = os.path.join(self.annotations_dir, candidate)
            if os.path.exists(path):
                return path
        return None


# Data transforms
train_transforms = T.Compose(
    [
        T.ToTensor(),
        T.RandomHorizontalFlip(0.5),
    ]
)

val_transforms = T.Compose(
    [
        T.ToTensor(),
    ]
)

# Create datasets
full_dataset = IBEMDataset(
    IBEM_IMAGES_DIR,
    IBEM_ANNOTATIONS_DIR,
    transforms=train_transforms,
    subset_fraction=SUBSET_FRACTION,
)

# Split into train/val (80/20)
train_size = int(0.8 * len(full_dataset))
val_size = len(full_dataset) - train_size
train_dataset, val_dataset = torch.utils.data.random_split(
    full_dataset, [train_size, val_size], generator=torch.Generator().manual_seed(42)
)

print(f"[✓] Train: {len(train_dataset)} | Val: {len(val_dataset)}")


def collate_fn(batch):
    """Custom collate for detection (variable-size targets)."""
    return tuple(zip(*batch))


# Windows + top-level training loop can fail with multiprocessing DataLoader spawn.
effective_num_workers = 0 if os.name == "nt" else NUM_WORKERS


train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE_DETECTION,
    shuffle=True,
    num_workers=effective_num_workers,
    collate_fn=collate_fn,
    pin_memory=True,
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE_DETECTION,
    shuffle=False,
    num_workers=effective_num_workers,
    collate_fn=collate_fn,
    pin_memory=True,
)


# ============================================================
# STEP 3: Build Model
# ============================================================
print("\n" + "=" * 60)
print("🏗️ STEP 3: Building Faster R-CNN model...")
print("=" * 60)

# Load pre-trained Faster R-CNN v2 (better than v1)
model = fasterrcnn_resnet50_fpn_v2(weights=FasterRCNN_ResNet50_FPN_V2_Weights.DEFAULT)

# Replace the classifier head for our 2 classes
in_features = model.roi_heads.box_predictor.cls_score.in_features
model.roi_heads.box_predictor = FastRCNNPredictor(in_features, NUM_CLASSES)

model = model.to(device)
print(f"[✓] Model loaded with {NUM_CLASSES} classes on {device}")

# Optimizer
params = [p for p in model.parameters() if p.requires_grad]
optimizer = torch.optim.AdamW(params, lr=LEARNING_RATE, weight_decay=0.0005)

# Learning rate scheduler (cosine annealing)
lr_scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
    optimizer, T_max=NUM_EPOCHS_DETECTION
)

# Mixed precision scaler for RTX 3060
scaler = torch.amp.GradScaler("cuda") if torch.cuda.is_available() else None


# ============================================================
# STEP 4: Training Loop
# ============================================================
print("\n" + "=" * 60)
print("🏋️ STEP 4: Training...")
print("=" * 60)

best_loss = float("inf")

for epoch in range(NUM_EPOCHS_DETECTION):
    # --- Train ---
    model.train()
    epoch_loss = 0.0
    num_batches = 0

    pbar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{NUM_EPOCHS_DETECTION}")
    for images, targets in pbar:
        images = [img.to(device) for img in images]
        targets = [{k: v.to(device) for k, v in t.items()} for t in targets]

        # Skip batches with no annotations
        valid = all(t["boxes"].shape[0] > 0 for t in targets)
        if not valid:
            continue

        optimizer.zero_grad()

        if scaler:
            with torch.amp.autocast("cuda"):
                loss_dict = model(images, targets)
                losses = sum(loss for loss in loss_dict.values())
            scaler.scale(losses).backward()
            # Gradient clipping (paper mentions this helps)
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(params, max_norm=1.0)
            scaler.step(optimizer)
            scaler.update()
        else:
            loss_dict = model(images, targets)
            losses = sum(loss for loss in loss_dict.values())
            losses.backward()
            torch.nn.utils.clip_grad_norm_(params, max_norm=1.0)
            optimizer.step()

        epoch_loss += losses.item()
        num_batches += 1
        pbar.set_postfix(loss=f"{losses.item():.4f}")

    avg_loss = epoch_loss / max(num_batches, 1)
    lr_scheduler.step()

    print(
        f"  Epoch {epoch+1}: Avg Loss = {avg_loss:.4f}, LR = {lr_scheduler.get_last_lr()[0]:.6f}"
    )

    # --- Save best model ---
    if avg_loss < best_loss:
        best_loss = avg_loss
        torch.save(model.state_dict(), SAVE_PATH)
        print(f"  💾 Best model saved! (loss: {best_loss:.4f})")


# ============================================================
# STEP 5: Final Save
# ============================================================
print("\n" + "=" * 60)
print("💾 STEP 5: Training complete!")
print("=" * 60)
print(f"  Best loss: {best_loss:.4f}")
print(f"  Model saved to: {SAVE_PATH}")
print(f"\n  To use in the pipeline:")
print(f"    Update config.py: YOLO_MODEL_PATH → use Faster R-CNN loading instead")
print(f"    Or export to ONNX for faster inference")
print(f"\n🎉 Detection model training complete!")
