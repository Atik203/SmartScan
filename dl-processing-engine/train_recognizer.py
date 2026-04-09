"""
SmartScan — Train Math Expression Recognition Model (TrOCR)
============================================================
Uses HuggingFace's load_dataset("yuntian-deng/im2latex-100k-raw").

KEY DESIGN: On-the-fly preprocessing via custom PyTorch Dataset.
            No pixel values written to disk → no disk space issue.
            HuggingFace cache redirected to E: drive.

Dataset splits: train (165,099) | val (18,216) | test (20,430)
10% subset   : train (16,509)  | val (1,821)  | test (2,043)

Hardware: RTX 3060 6GB VRAM + 32GB RAM (Ryzen 7 5800H)

Usage:
    cd E:\\PROJECT\\SmartScan\\dl-processing-engine
    .venv\\Scripts\\python.exe train_recognizer.py
"""

import os
import sys
import torch
import warnings
warnings.filterwarnings("ignore")

# ── Redirect HuggingFace cache to G: drive (200GB free) ──────────────────
os.environ["HF_HOME"]                       = "G:/SmartScan-Cache/hf"
os.environ["HF_DATASETS_CACHE"]             = "G:/SmartScan-Cache/hf/datasets"
os.environ["TRANSFORMERS_CACHE"]            = "G:/SmartScan-Cache/hf/transformers"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import (
    MODELS_DIR, DEVICE, BATCH_SIZE_RECOGNITION,
    NUM_EPOCHS_RECOGNITION, LEARNING_RATE, ensure_dirs,
)

ensure_dirs()

# ============================================================
# STEP 1: Load Dataset (metadata only — images loaded on-the-fly)
# ============================================================
print("=" * 60)
print("[STEP 1] Loading Im2LaTeX-100K from HuggingFace...")
print("         Cache: E:/PROJECT/SmartScan/.cache/hf")
print("=" * 60)

from datasets import load_dataset, disable_caching

# Disable HuggingFace dataset caching (avoids Windows file-lock errors
# during shuffle/select; safe since we have 32GB RAM)
disable_caching()

dataset = load_dataset("yuntian-deng/im2latex-100k-raw")
print(f"[OK] Dataset loaded!")
print(f"     Train : {len(dataset['train']):,}")
print(f"     Val   : {len(dataset['val']):,}")
print(f"     Test  : {len(dataset['test']):,}")

# ============================================================
# STEP 2: 10% subset
# ============================================================
print("\n[STEP 2] Creating 10% subset...")

SUBSET = 0.10
train_size = int(len(dataset["train"]) * SUBSET)
val_size   = int(len(dataset["val"])   * SUBSET)

train_raw = dataset["train"].shuffle(seed=42).select(range(train_size))
val_raw   = dataset["val"].shuffle(seed=42).select(range(val_size))

print(f"[OK] Train: {len(train_raw):,} | Val: {len(val_raw):,}")

# ============================================================
# STEP 3: Load TrOCR Model + Processor
# ============================================================
print("\n[STEP 3] Loading TrOCR model...")

from transformers import (
    TrOCRProcessor,
    VisionEncoderDecoderModel,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    default_data_collator,
)

MODEL_NAME = "microsoft/trocr-base-printed"
processor  = TrOCRProcessor.from_pretrained(MODEL_NAME)
model      = VisionEncoderDecoderModel.from_pretrained(MODEL_NAME)

# Configure decoder for LaTeX generation
model.config.decoder_start_token_id = processor.tokenizer.cls_token_id
model.config.pad_token_id           = processor.tokenizer.pad_token_id
model.config.vocab_size             = model.config.decoder.vocab_size
model.config.eos_token_id          = processor.tokenizer.sep_token_id
model.config.max_length            = 256
model.config.early_stopping        = True
model.config.no_repeat_ngram_size  = 3
model.config.length_penalty        = 2.0
model.config.num_beams             = 4

device = torch.device(DEVICE if torch.cuda.is_available() else "cpu")
print(f"[OK] Device : {device}")
if torch.cuda.is_available():
    gpu  = torch.cuda.get_device_properties(0)
    vram = gpu.total_memory / 1e9
    print(f"[OK] GPU    : {gpu.name}  ({vram:.1f} GB VRAM)")

# ============================================================
# STEP 4: Custom PyTorch Dataset (on-the-fly preprocessing)
#         NO disk write — pixel values computed per-batch
# ============================================================
print("\n[STEP 4] Setting up on-the-fly dataset (no disk cache)...")

from torch.utils.data import Dataset as TorchDataset

class Im2LaTeXDataset(TorchDataset):
    """Wraps HuggingFace dataset, processes images on-the-fly."""

    def __init__(self, hf_dataset, processor, max_length=256):
        self.ds         = hf_dataset
        self.processor  = processor
        self.max_length = max_length

    def __len__(self):
        return len(self.ds)

    def __getitem__(self, idx):
        row    = self.ds[idx]
        image  = row["image"].convert("RGB")
        formula = str(row["formula"])

        # Image → pixel values
        pixel_values = self.processor(
            images=image, return_tensors="pt"
        ).pixel_values.squeeze(0)  # shape: (3, H, W)

        # Formula → token ids
        labels = self.processor.tokenizer(
            formula,
            padding="max_length",
            max_length=self.max_length,
            truncation=True,
            return_tensors="pt",
        ).input_ids.squeeze(0)

        # Mask padding
        labels[labels == self.processor.tokenizer.pad_token_id] = -100
        return {"pixel_values": pixel_values, "labels": labels}


train_torch_ds = Im2LaTeXDataset(train_raw, processor)
val_torch_ds   = Im2LaTeXDataset(val_raw,   processor)
print(f"[OK] Train: {len(train_torch_ds):,} | Val: {len(val_torch_ds):,}")

# ============================================================
# STEP 5: Training
# ============================================================
print("\n" + "=" * 60)
print(f"[STEP 5] Training TrOCR...")
print(f"         Epochs     : {NUM_EPOCHS_RECOGNITION}")
print(f"         Batch size : {BATCH_SIZE_RECOGNITION}  (fp16 + 2x grad accum)")
print(f"         Eff. batch : {BATCH_SIZE_RECOGNITION * 2}")
print(f"         LR         : {LEARNING_RATE}")
print("=" * 60)

OUTPUT_DIR = os.path.join(MODELS_DIR, "trocr-latex")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.environ["TENSORBOARD_LOGGING_DIR"] = os.path.join(OUTPUT_DIR, "logs")

training_args = Seq2SeqTrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=NUM_EPOCHS_RECOGNITION,
    per_device_train_batch_size=BATCH_SIZE_RECOGNITION,
    per_device_eval_batch_size=BATCH_SIZE_RECOGNITION,
    learning_rate=LEARNING_RATE,
    weight_decay=0.01,
    warmup_steps=300,
    logging_steps=50,
    eval_strategy="steps",
    eval_steps=300,
    save_strategy="steps",
    save_steps=300,
    save_total_limit=2,
    predict_with_generate=True,
    fp16=torch.cuda.is_available(),
    gradient_accumulation_steps=2,
    dataloader_num_workers=0,     # 0 = main process (avoids Windows spawn issues)
    report_to="tensorboard",
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",
    greater_is_better=False,
)

trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=train_torch_ds,
    eval_dataset=val_torch_ds,
    data_collator=default_data_collator,  # handles pre-padded tensors directly
)

print("[OK] Trainer ready. Starting training loop...")
train_result = trainer.train()

# ============================================================
# STEP 6: Save model
# ============================================================
print("\n[STEP 6] Saving model...")
trainer.save_model(OUTPUT_DIR)
processor.save_pretrained(OUTPUT_DIR)
print(f"[OK] Model saved to : {OUTPUT_DIR}")
print(f"[OK] Loss           : {train_result.training_loss:.4f}")
print(f"[OK] Steps          : {train_result.global_step}")

# ============================================================
# STEP 7: Quick inference test
# ============================================================
print("\n[STEP 7] Quick inference test...")
test_sample  = dataset["test"][0]
test_image   = test_sample["image"].convert("RGB")
ground_truth = test_sample["formula"]

model = model.to(device)
pixel_values = processor(test_image, return_tensors="pt").pixel_values.to(device)

with torch.no_grad():
    generated = model.generate(pixel_values, max_length=256)

predicted = processor.batch_decode(generated, skip_special_tokens=True)[0]
print(f"  Ground Truth : {ground_truth[:100]}")
print(f"  Predicted    : {predicted[:100]}")

print("\n[DONE] Training complete!")
print(f"       Model saved at: {OUTPUT_DIR}")
