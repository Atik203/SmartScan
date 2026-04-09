# 🔧 SmartScan — Code Repository Setup & Modification Guide

> **Purpose:** This document maps every file in the original author's codebase, highlights what must be changed (hardcoded paths, credentials, model weights), and provides direct download links for all required datasets and pre-trained models.

---

## 📂 New Repository Folder Structure

After renaming for GitHub readability:

```text
SmartScan/
├── arduino-controller/          # (was: Complete_automation_code_arduino)
│   └── Complete_automation_code_arduino.ino
├── raspberry-pi-bridge/         # (was: raspberrypi code)
│   ├── auto3.py                 # Serial listener (Arduino → Pi)
│   └── auto_capture_3_updated.py # ADB camera trigger + image pull
├── dl-processing-engine/        # (was: PythonProject)
│   ├── config.py                # [NEW] Centralized configuration (ALL paths here)
│   ├── app.py                   # Flask offline web interface
│   ├── processing.py            # Crop / dewarp / YOLO detect (online)
│   ├── offline_processing.py    # Crop / dewarp / YOLO detect (offline)
│   ├── run_on_laptop.py         # SSH/SCP listener for Pi images
│   ├── train_recognizer.py      # [NEW] TrOCR training (HuggingFace)
│   ├── train_detector.py        # [NEW] Faster R-CNN training (IBEM)
│   ├── data/                    # [NEW] Auto-created processing data
│   └── templates/
│       ├── index.html           # Upload UI
│       └── result.html          # Results display
├── smartscan-web/               # [NEW] Next.js + shadcn/ui web dashboard (built!)
├── datasets/                    # [NEW] Store 10% sampled datasets here
├── models/                      # [NEW] Store downloaded model weights here
├── requirements.txt             # [NEW] Python dependencies (CUDA 12.1)
├── Project_Details.md           # Project proposal (single most important file)
├── Code_Setup_Guide.md          # ← This file
├── WebApp_Plan.md               # Next.js web app development plan
└── .gitignore                   # Git exclusions
```

---

## 📥 Dataset Download Links

The paper uses **two** public datasets. We will use **~10% of each** to keep training fast.

### 1. IBEM Dataset (Math Expression Detection)

| Field | Details |
|---|---|
| **Full Name** | IBEM — Scientific Image Dataset for Indexing/Searching Math Expressions |
| **Task** | Train Faster R-CNN to detect bounding boxes around math expressions |
| **Full Size** | ~3,000+ annotated document images |
| **Our Target** | ~300 images (10%) — stratified sample |
| **Download** | [https://doi.org/10.5281/zenodo.4757865](https://doi.org/10.5281/zenodo.4757865) |
| **Alt Mirror** | [https://zenodo.org/records/4756857](https://zenodo.org/records/4756857) |
| **Format** | Images (.png) + XML/JSON annotation files with bounding boxes |
| **Paper Reference** | Anitei et al., "The IBEM dataset", Pattern Recognition Letters, 2023 |

**10% Sampling Strategy:**
```python
# After downloading, run this to create a 10% subset
import os, random, shutil

random.seed(42)
all_images = sorted(os.listdir("datasets/ibem_full/images"))
sample = random.sample(all_images, k=len(all_images) // 10)

os.makedirs("datasets/ibem_10pct/images", exist_ok=True)
os.makedirs("datasets/ibem_10pct/annotations", exist_ok=True)

for img in sample:
    shutil.copy(f"datasets/ibem_full/images/{img}", f"datasets/ibem_10pct/images/{img}")
    ann = img.replace(".png", ".xml")  # adjust extension as needed
    if os.path.exists(f"datasets/ibem_full/annotations/{ann}"):
        shutil.copy(f"datasets/ibem_full/annotations/{ann}", f"datasets/ibem_10pct/annotations/{ann}")

print(f"Sampled {len(sample)} images for 10% subset")
```

### 2. Im2LaTeX-100K Dataset (Math Expression → LaTeX Recognition)

| Field | Details |
|---|---|
| **Full Name** | Im2LaTeX-100K (Image-to-LaTeX) |
| **Task** | Train Vision Encoder-Decoder (TrOCR) to convert math images → LaTeX |
| **Full Size** | ~100,000 formula image + LaTeX pairs |
| **Our Target** | ~10,000 pairs (10%) |
| **HuggingFace (Easiest! ✅)** | `yuntian-deng/im2latex-100k-raw` — auto-downloads in Python |
| **Alt: Zenodo** | [https://doi.org/10.5281/zenodo.56198](https://doi.org/10.5281/zenodo.56198) |
| **Alt: Kaggle** | [https://www.kaggle.com/datasets/shahrukhkhan/im2latex100k](https://www.kaggle.com/datasets/shahrukhkhan/im2latex100k) |
| **Format** | Auto-loaded Image + formula text pairs |
| **Paper Reference** | Kanervisto, A., Zenodo, 2016 |

> ✅ **RECOMMENDED:** Use HuggingFace `load_dataset` — no manual download needed!

**Easiest Way — HuggingFace (used in our `train_recognizer.py`):**
```python
from datasets import load_dataset

# Auto-downloads ~2GB on first run, cached after that
dataset = load_dataset("yuntian-deng/im2latex-100k-raw")

# Take 10% subset
train_10pct = dataset["train"].shuffle(seed=42).select(range(len(dataset["train"]) // 10))
val_10pct = dataset["validation"].shuffle(seed=42).select(range(len(dataset["validation"]) // 10))

print(f"Train: {len(train_10pct)} | Val: {len(val_10pct)}")
# Access: train_10pct[0]["image"], train_10pct[0]["formula"]
```

---

## 🤖 Pre-Trained Models Required

### 1. Math Expression Detection Model (Faster R-CNN)

The paper's **best model** is a custom Faster R-CNN with ResNet50+FPN and custom RoI Heads (called "ResNet50 V3 — Advanced"), trained on IBEM.

**For our project, we have two options:**

| Option | How | Notes |
|---|---|---|
| **A) Train from scratch (recommended)** | Fine-tune `torchvision.models.detection.fasterrcnn_resnet50_fpn(pretrained=True)` on our 10% IBEM | Gives us full control; matches the paper |
| **B) Use YOLOv8 (simpler alternative)** | The existing code already uses `ultralytics.YOLO` | Faster training; paper shows 86.49% mIoU vs 87.42% for Faster R-CNN |

```python
# Option A: PyTorch Faster R-CNN (paper's approach)
import torchvision
model = torchvision.models.detection.fasterrcnn_resnet50_fpn(pretrained=True)
# Modify box_predictor for 2 classes: background + math_expression
num_classes = 2
in_features = model.roi_heads.box_predictor.cls_score.in_features
model.roi_heads.box_predictor = torchvision.models.detection.faster_rcnn.FastRCNNPredictor(in_features, num_classes)

# Option B: YOLOv8 (what existing code uses)
from ultralytics import YOLO
model = YOLO("yolov8n.pt")  # start with nano, fine-tune on IBEM
```

### 2. Math Expression Recognition Model (TrOCR / Vision Encoder-Decoder)

The paper uses Microsoft TrOCR fine-tuned on Im2LaTeX-100K.

| Resource | Link |
|---|---|
| **Microsoft TrOCR Base** | `microsoft/trocr-base-printed` on HuggingFace |
| **Community LaTeX model** | `tjoab/latex_finetuned` on HuggingFace |
| **Pix2Tex (alternative)** | [https://github.com/lukas-blecher/LaTeX-OCR](https://github.com/lukas-blecher/LaTeX-OCR) |

```python
from transformers import VisionEncoderDecoderModel, TrOCRProcessor

# Load pre-trained TrOCR for math
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")

# Fine-tune on our 10% Im2LaTeX subset
# OR use community model directly:
# model = VisionEncoderDecoderModel.from_pretrained("tjoab/latex_finetuned")
```

---

## ✅ Path Updates — DONE (Centralized in `config.py`)

> All hardcoded `D:/` paths have been replaced. All Python files now import from `dl-processing-engine/config.py`.
> **The only file you need to edit is `config.py`** — update your Pi IP, Pi username, and phone serial numbers there.

### What was fixed:

| File | Status | Details |
|---|---|---|
| `dl-processing-engine/config.py` | ✅ **NEW** | All paths, PI credentials, training config centralized here |
| `dl-processing-engine/run_on_laptop.py` | ✅ Fixed | Imports from `config.py` |
| `dl-processing-engine/app.py` | ✅ Fixed | Imports from `config.py` |
| `dl-processing-engine/processing.py` | ✅ Fixed | Imports from `config.py` |
| `dl-processing-engine/offline_processing.py` | ✅ Fixed | Imports from `config.py` |
| `raspberry-pi-bridge/auto3.py` | ✅ Fixed | Uses `os.path` relative to script |
| `raspberry-pi-bridge/auto_capture_3_updated.py` | ✅ Fixed | Uses `os.path.expanduser` |
| `arduino-controller/*.ino` | ✅ No changes needed | Pin definitions are hardware-specific |

### What YOU need to update in `config.py`:

```python
# In dl-processing-engine/config.py — update these values:
PI_IP = "192.168.1.100"          # ← Your Pi's IP address
PI_USER = "pi"                   # ← Your Pi's SSH username

# In raspberry-pi-bridge/auto_capture_3_updated.py — update these:
ADB_DEVICE_PATHS = {
    "YOUR_LEFT_PHONE_SERIAL": "...",   # Run: adb devices
    "YOUR_RIGHT_PHONE_SERIAL": "...",
}
```

---

## 📦 Python Dependencies

Create a `requirements.txt` in the root:

```txt
# Deep Learning Core
torch>=2.0.0
torchvision>=0.15.0
transformers>=4.30.0
ultralytics>=8.0.0

# Image Processing
opencv-python>=4.8.0
numpy>=1.24.0
Pillow>=10.0.0

# Web Interface (Flask - existing offline UI)
flask>=3.0.0
werkzeug>=3.0.0

# Page Dewarping
page-dewarp>=0.3.0

# OCR
pytesseract>=0.3.10

# Serial Communication (Raspberry Pi)
pyserial>=3.5

# Metrics & Evaluation
scikit-learn>=1.3.0
nltk>=3.8.0  # for BLEU score

# Utilities
matplotlib>=3.7.0
tqdm>=4.65.0
```

### Quick Install

```bash
# On Laptop (Processing Engine)
cd dl-processing-engine
pip install -r ../requirements.txt

# On Raspberry Pi (Bridge)
pip install pyserial opencv-python-headless
```

---

## 🚀 Getting Started — Quick Checklist

### Step 1: Install Python + CUDA
```bash
# Install PyTorch with CUDA 12.1 (for RTX 3060)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Install all other dependencies
pip install -r requirements.txt
```

### Step 2: Create directories
```bash
cd E:\PROJECT\SmartScan\dl-processing-engine
python config.py   # Creates all required directories
```

### Step 3: Train models
```bash
# Recognition model (TrOCR) — auto-downloads Im2LaTeX from HuggingFace!
python train_recognizer.py

# Detection model (Faster R-CNN) — requires IBEM dataset download first
python train_detector.py
```

### Step 4: Run web dashboard
```bash
cd E:\PROJECT\SmartScan\smartscan-web
npm run dev   # Opens at http://localhost:3000
```

### Full Checklist
- [ ] Clone this repo
- [ ] Install PyTorch with CUDA 12.1 (see above)
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Run `python config.py` to create directories
- [ ] Edit `config.py` with your Pi IP and phone serial numbers
- [ ] Train TrOCR: `python train_recognizer.py` (auto-downloads Im2LaTeX!)
- [ ] Download IBEM dataset → extract to `datasets/ibem/`
- [ ] Train Faster R-CNN: `python train_detector.py`
- [ ] Install Tesseract OCR
- [ ] Flash Arduino sketch via Arduino IDE
- [ ] Setup Raspberry Pi with ADB + Python serial listener
- [ ] Run web dashboard: `cd smartscan-web && npm run dev`
- [ ] Test offline Flask UI: `cd dl-processing-engine && python app.py`

---

## 🔗 Key External Links

| Resource | URL |
|---|---|
| **Paper (IEEE Access)** | DOI: 10.1109/ACCESS.2025.3638780 |
| **IBEM Dataset** | https://doi.org/10.5281/zenodo.4757865 |
| **Im2LaTeX-100K** | https://doi.org/10.5281/zenodo.56198 |
| **Im2LaTeX Tools** | https://github.com/Miffyli/im2latex-dataset |
| **TrOCR (Microsoft)** | https://huggingface.co/microsoft/trocr-base-printed |
| **LaTeX Fine-tuned TrOCR** | https://huggingface.co/tjoab/latex_finetuned |
| **Pix2Tex (LaTeX-OCR)** | https://github.com/lukas-blecher/LaTeX-OCR |
| **page-dewarp** | https://pypi.org/project/page-dewarp/ |
| **Tesseract OCR** | https://github.com/tesseract-ocr/tesseract |
| **YOLOv8 (Ultralytics)** | https://github.com/ultralytics/ultralytics |
| **BOM & CAD Files (Authors)** | SharePoint link in paper's Appendix footnote |
