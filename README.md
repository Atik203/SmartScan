<div align="center">

<img src="https://img.shields.io/badge/SmartScan-Automated%20Book%20Digitizer-6366f1?style=for-the-badge&logo=bookstack&logoColor=white" alt="SmartScan" />

# 📚 SmartScan — Automated Book Digitizer & LaTeX Extractor

**An AI-powered, hardware-integrated system for autonomously digitizing physical books with deep learning math detection and recognition.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-00FFFF?style=flat-square&logo=pytorch&logoColor=black)](https://ultralytics.com)
[![TrOCR](https://img.shields.io/badge/TrOCR-Microsoft-0078D4?style=flat-square&logo=microsoft&logoColor=white)](https://huggingface.co/microsoft/trocr-base-printed)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE.md)

> **UIU · CSE 4326 — Microprocessors & Microcontrollers Lab**  
> Automated book digitizer with Deep Learning math detection/recognition running on Raspberry Pi 5

[Features](#-features) • [Architecture](#-system-architecture) • [Quick Start](#-quick-start) • [Hardware](#-hardware-setup) • [API Docs](#-api-reference) • [Contributing](CONTRIBUTING.md)

</div>

---

## 🎯 What is SmartScan?

SmartScan is a **fully automated book digitization system** that combines custom-built hardware with state-of-the-art deep learning to convert physical books into searchable, LaTeX-enriched digital documents.

**The system autonomously:**
1. 🤖 **Flips book pages** using an Arduino-controlled servo mechanism (gripper + flipper)
2. 📸 **Captures dual-camera photos** via ADB-connected smartphones on Raspberry Pi 5
3. 🧠 **Detects math expressions** using YOLOv8 / Faster R-CNN trained on the IBEM dataset
4. 🔢 **Converts math to LaTeX** using a fine-tuned TrOCR model (Im2LaTeX-100K)
5. 📄 **Assembles a PDF book** with Pandoc + XeLaTeX, preserving math formulas beautifully
6. 🖥️ **Displays everything** in a real-time Next.js dashboard with KaTeX rendering

---

## ✨ Features

### 🔧 Hardware & Embedded
- **Arduino Mega** with 4× MG996R servos — gripper pair + flipper pair
- Potentiometer-based position calibration with persistent save (Pos1/Pos2)
- Fan relay control for thermal management
- Full automation state machine: `GRIPPER_CYCLE → WAIT → FLIPPER_CYCLE → WAIT → COMPLETED_CYCLE`
- Serial CAPTURE signal triggers camera capture

### 🍓 Raspberry Pi 5 Bridge
- Serial listener (`auto3.py`) on `/dev/ttyUSB0` at 9600 baud
- **Dual-phone ADB capture** — Redmi Note 13 Pro + Vivo X300 Pro (50MP+)
- Smart duplicate detection, auto-rotation (L: CCW, R: CW)
- 6-second ISP wait for high-megapixel processing
- Persistent page counter across sessions

### 🤖 AI / Machine Learning Pipeline
| Component | Model | Dataset | Metric |
|---|---|---|---|
| **Math Detection** | YOLOv8n fine-tuned | IBEM (~3K images) | ~86% mIoU |
| **Math Detection (alt)** | Faster R-CNN ResNet50+FPN V2 | IBEM 10% subset | ~87% mIoU |
| **Math Recognition** | TrOCR fine-tuned | Im2LaTeX-100K (10%) | BLEU score |
| **Text OCR** | Tesseract 5 | — | Production grade |
| **Bulk Processing** | Gemini 2.5 Flash Lite | — | API-powered |

### 🌐 Full-Stack Web Dashboard (Next.js)
- **Dashboard** — Live pipeline health, real-time activity feed, stats cards
- **Batch Processor** — Upload & process multiple pages with progress tracking
- **Gallery** — Visual viewer: Original → Cropped → Dewarped → Detected
- **LaTeX Preview** — Per-page formula cards with KaTeX rendering + copy/export
- **Book Reader** — Page-by-page e-reader with Markdown+KaTeX and PDF iframe modes
- **System Monitor** — Hardware health badges, API usage tracking, logs

### 📄 Document Pipeline
- Image crop → whiteness normalization (background division)
- Page dewarping via illumination correction
- YOLO math detection → bounding box extraction
- **Intelligent routing:** Pure text → Tesseract | Math pages → TrOCR + Gemini
- Per-page `.md` files → merged → Pandoc PDF compilation with XeLaTeX

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        HARDWARE LAYER                               │
│  ┌─────────────┐    Serial    ┌──────────────────────────────────┐  │
│  │   Arduino   │ ──CAPTURE──▶ │         Raspberry Pi 5           │  │
│  │  (Servos)   │              │  auto3.py ──▶ auto_capture_pi5.py│  │
│  └─────────────┘              │         ADB ──▶ Phone Cameras    │  │
│                               └──────────────┬───────────────────┘  │
└──────────────────────────────────────────────┼─────────────────────┘
                                               │ Images
                                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Flask · Port 5000)                    │
│                                                                     │
│  POST /process-page                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────┐  │
│  │  Crop    │▶│ Dewarp  │▶│  YOLO    │▶│ Traffic Controller │  │
│  │(10px pad)│  │(Whiteness│  │ Detect   │  │                    │  │
│  └──────────┘  │ Filter)  │  │ Math Expr│  │ math_count == 0?  │  │
│                └──────────┘  └──────────┘  │  → Tesseract OCR   │  │
│                                            │ math_count > 0?    │  │
│                                            │  → Gemini API      │  │
│                                            │  ↘ TrOCR fallback  │  │
│                                            └─────────┬──────────┘  │
│                                                      │             │
│  page_assembler.py ◀─────────────────── page_NNN.md ◀┘             │
│  Pandoc + XeLaTeX ──▶ Final_Book.pdf                               │
└──────────────────────────────────────────────────────┬─────────────┘
                                                       │ REST API
                                                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js 16 · Port 3000)                  │
│  Dashboard │ Batch │ Gallery │ LaTeX │ Reader │ System              │
│  KaTeX rendering · SWR polling · Framer Motion animations           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
SmartScan/
├── arduino/                              # Arduino firmware
│   ├── Complete_automation_code_arduino/ 
│   │   └── Complete_automation_code_arduino.ino  # Main firmware (869 lines)
│   └── sensor/                           # Sensor test sketches
│
├── raspberrypi/                          # Raspberry Pi 5 camera bridge
│   ├── auto3.py                          # Serial listener (Arduino → Pi)
│   ├── auto_capture_pi5.py               # ADB dual-phone capture
│   ├── auto_capture.py                   # Single-phone variant
│   ├── auto3.py                          # Auto-capture bridge
│   └── requirements.txt                  # Pi Python deps (pyserial)
│
├── backend/                              # Flask API (Python)
│   ├── app.py                            # Main Flask app (10+ endpoints)
│   ├── config.py                         # Centralized configuration
│   ├── traffic_controller.py             # ML routing logic
│   ├── gemini_router.py                  # Gemini API integration
│   ├── trocr_inference.py                # TrOCR model inference
│   ├── tesseract_ocr.py                  # Tesseract OCR wrapper
│   ├── page_assembler.py                 # Page listing + Pandoc PDF compile
│   ├── train_detector.py                 # Faster R-CNN training script
│   ├── train_recognizer.py               # TrOCR fine-tuning script
│   ├── download_dataset.py               # IBEM + Im2LaTeX downloader
│   ├── requirements.txt                  # Python dependencies
│   ├── .env.example                      # Environment variable template
│   └── static/                           # Processed image outputs
│       ├── upload/                       # Original uploads
│       ├── cropped/                      # Cropped images
│       ├── dewarped/                     # Whiteness-normalized images
│       ├── predicted/                    # YOLO detection overlays
│       └── extracted/                    # Cropped math expression regions
│
├── frontend/                             # Next.js 16 dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                  # Dashboard
│   │   │   ├── batch/page.tsx            # Batch processor
│   │   │   ├── gallery/page.tsx          # Image gallery
│   │   │   ├── latex/page.tsx            # LaTeX preview
│   │   │   ├── reader/page.tsx           # Book reader
│   │   │   └── system/page.tsx           # System monitor
│   │   ├── lib/
│   │   │   └── flask-api.ts              # Typed Flask HTTP client
│   │   └── hooks/
│   │       └── use-smartscan.ts          # SWR polling hooks
│   └── package.json
│
├── models/                               # ML model weights
│   ├── best.pt                           # YOLOv8 (download from Colab)
│   ├── fasterrcnn_math_detector.pt       # Faster R-CNN weights
│   └── trocr-latex/                      # Fine-tuned TrOCR directory
│
├── datasets/                             # Training datasets
│   └── ibem/                             # IBEM math detection dataset
│
├── SmartScan_Captures/                   # Real captured book page images
│   └── page_XXX_YYY.jpg                  # Dual-page spreads (20 images)
│
├── Math_Detection_YOLOv8.ipynb           # Colab training notebook (Detection)
├── Math_Recognition_TrOCR.ipynb          # Colab training notebook (Recognition)
├── model_training_comparison.md          # Model metrics comparison
├── Code_Setup_Guide.md                   # Detailed setup & path guide
├── Plan.md                               # Full project development plan
├── LAPTOP_SETUP.md                       # Windows dev environment setup
├── CONTRIBUTING.md                       # Contribution guidelines
├── SECURITY.md                           # Security policy
├── LICENSE.md                            # MIT License
└── README.md                             # ← You are here
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.10+ | Backend |
| Node.js | 18+ | Frontend |
| CUDA | 12.1+ | GPU acceleration (optional) |
| Tesseract OCR | 5.x | Text extraction |
| Pandoc | 3.x | PDF compilation |
| TeX Live / MiKTeX | Latest | XeLaTeX engine |
| Arduino IDE | 2.x | Firmware upload |

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Atik203/SmartScan---Automated-Book-Digitizer---LaTeX-Extractor.git
cd SmartScan
```

---

### 2️⃣ Backend Setup (Flask API)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS / Raspberry Pi
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# For GPU acceleration (CUDA 12.1):
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

**Configure environment variables:**

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values:
# GEMINI_API_KEY=your_gemini_api_key_here
# GEMINI_MODEL=gemini-2.5-flash-lite-preview-06-17
```

**Initialize directories:**

```bash
python config.py   # Creates all required output directories
```

**Start the Flask API:**

```bash
python app.py
# → API running at http://localhost:5000
```

---

### 3️⃣ Frontend Setup (Next.js Dashboard)

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_FLASK_URL=http://localhost:5000" > .env.local

# Start development server
npm run dev
# → Dashboard at http://localhost:3000
```

---

### 4️⃣ Install System Dependencies

**Windows (PowerShell):**

```powershell
# Tesseract OCR
winget install UB-Mannheim.TesseractOCR

# Pandoc document converter
winget install JohnMacFarlane.Pandoc

# MiKTeX (LaTeX engine)
winget install MiKTeX.MiKTeX
```

**Linux / Raspberry Pi OS:**

```bash
# Tesseract OCR
sudo apt install -y tesseract-ocr tesseract-ocr-eng

# Pandoc + XeLaTeX
sudo apt install -y pandoc texlive-xetex texlive-fonts-recommended

# Verify installations
tesseract --version && pandoc --version && xelatex --version
```

---

## 🔬 ML Model Training

### Option A: Google Colab (Recommended — GPU)

1. Open `Math_Detection_YOLOv8.ipynb` in [Google Colab](https://colab.research.google.com)
2. Enable **GPU** (A100 40GB recommended with Colab Pro)
3. Run all cells — models auto-save to Google Drive
4. Download `best.pt` → place in `models/`

5. Open `Math_Recognition_TrOCR.ipynb` in Colab
6. Run all cells — auto-downloads Im2LaTeX from HuggingFace
7. Download `trocr_final/` → place in `models/trocr-latex/`

### Option B: Local Training (CPU/GPU)

```bash
cd backend

# Train TrOCR (auto-downloads Im2LaTeX-100K from HuggingFace ~2GB)
python train_recognizer.py

# Download IBEM dataset first (see Code_Setup_Guide.md)
# Then train Faster R-CNN detector:
python train_detector.py
```

### Datasets

| Dataset | Task | Size | Download |
|---------|------|------|----------|
| IBEM | Math detection (bounding boxes) | ~3,000 images | [Zenodo](https://doi.org/10.5281/zenodo.4757865) |
| Im2LaTeX-100K | Math → LaTeX recognition | ~100K pairs | Auto via HuggingFace |

---

## 🍓 Raspberry Pi 5 Deployment (Recommended for Demo)

Deploy the full backend to Pi 5 for a self-contained, embedded system:

```bash
# On Windows — sync project to Pi 5
rsync -avz E:/PROJECT/SmartScan/ pi@192.168.1.100:~/SmartScan/ \
  --exclude node_modules --exclude venv

# On Pi 5 — setup backend
cd ~/SmartScan/backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Install system tools on Pi
sudo apt install -y tesseract-ocr pandoc texlive-xetex

# Start serial listener (Terminal 1)
cd ~/SmartScan/raspberrypi && python3 auto3.py

# Start Flask API (Terminal 2)
cd ~/SmartScan/backend && python3 app.py
# → Flask API at http://PI_IP:5000
```

**Connect laptop frontend to Pi backend:**

```bash
# In frontend/.env.local on your laptop:
NEXT_PUBLIC_FLASK_URL=http://192.168.1.100:5000

# Run the dashboard:
cd frontend && npm run dev
# → http://localhost:3000 (UI on laptop, processing on Pi)
```

---

## 🔌 Hardware Setup

### Arduino Wiring

| Component | Pins | Notes |
|-----------|------|-------|
| Left Gripper Servo | Pin 9 | MG996R |
| Right Gripper Servo | Pin 10 | MG996R |
| Left Flipper Servo | Pin 11 | MG996R |
| Right Flipper Servo | Pin 12 | MG996R |
| Position Potentiometer | A0 | Calibration |
| Fan Relay | Pin 7 | Thermal control |

**Flash firmware:**
1. Open `arduino/Complete_automation_code_arduino/Complete_automation_code_arduino.ino` in Arduino IDE
2. Select board: **Arduino Mega 2560**
3. Upload sketch
4. Use Serial Monitor (9600 baud) for calibration

### ADB Phone Setup (Raspberry Pi)

```bash
# Install ADB
sudo apt install -y android-tools-adb

# Enable USB Debugging on both phones
# Connect phones via USB — verify detection
adb devices

# Update serial numbers in raspberrypi/auto_capture_pi5.py:
# ADB_DEVICE_PATHS = {
#     "YOUR_LEFT_PHONE_SERIAL": "/sdcard/DCIM/Camera",
#     "YOUR_RIGHT_PHONE_SERIAL": "/sdcard/DCIM/Camera",
# }
```

---

## 🌐 API Reference

Base URL: `http://localhost:5000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/process-page` | Full pipeline: upload → crop → dewarp → detect → route → markdown |
| `POST` | `/process-captures` | Batch process all images in `SmartScan_Captures/` |
| `POST` | `/recognize` | Run TrOCR on a single cropped math image |
| `GET` | `/status` | Queue state, pages scanned, recent activity |
| `GET` | `/health` | Arduino/Pi/model/Tesseract/Pandoc health |
| `GET` | `/usage` | Gemini API usage tracking |
| `GET` | `/pages` | List all processed pages |
| `GET` | `/pages/<n>` | Get markdown content for page N |
| `GET` | `/book/pdf` | Compile and stream the final PDF |
| `GET` | `/gallery/<name>` | Get all image versions for a processed file |
| `GET` | `/images/<path>` | Static image serving |

**Example — Process a page:**

```bash
curl -X POST http://localhost:5000/process-page \
  -F "image=@page_001.jpg" \
  -F "page_number=1"
```

**Example — Get system health:**

```bash
curl http://localhost:5000/health | python -m json.tool
```

---

## 🧪 End-to-End Test

```
1. Power on Arduino → Calibrate gripper/flipper positions
2. Start Pi serial listener: python3 auto3.py
3. Start Flask backend: python app.py (port 5000)
4. Start Next.js frontend: npm run dev (port 3000)
5. Press "Automation Start" on Arduino panel
6. Watch: Grip → CAPTURE signal → Photo → Pull → Crop → Dewarp → Detect → Route → Markdown → PDF
7. Open /reader at http://localhost:3000/reader to view the digitized book
```

---

## 🛡️ The Hybrid AI Strategy

SmartScan uses a **hybrid routing architecture** that selects the optimal AI engine per page:

```python
# traffic_controller.py
def route_page(image_path, detected_boxes, ...):
    if len(detected_boxes) == 0:
        # Path A: Pure text → Tesseract (local, free, fast)
        return tesseract_ocr(image_path)
    else:
        try:
            # Path B: Math-heavy → Gemini API (bulk processing)
            return gemini_process(image_path)
        except Exception:
            # Fallback: TrOCR + Tesseract (local, academic proof)
            latex_blocks = trocr_recognize(detected_boxes)
            text = tesseract_ocr(image_path)
            return merge(text, latex_blocks)
```

The trained deep learning models (YOLOv8, Faster R-CNN, TrOCR) serve as **academic proof of understanding** of CV architectures. The Gemini API handles the 95% production case with superior speed and quality.

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key ([get here](https://aistudio.google.com/apikey)) |
| `GEMINI_MODEL` | No | Model name (default: `gemini-2.5-flash-lite-preview-06-17`) |
| `SMARTSCAN_CACHE_ROOT` | No | HuggingFace cache directory (default: system cache) |
| `TESSERACT_CMD` | Windows only | Path to `tesseract.exe` |
| `NEXT_PUBLIC_FLASK_URL` | Frontend | Flask API URL (default: `http://localhost:5000`) |

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Microcontroller** | Arduino Mega 2560 |
| **Embedded Linux** | Raspberry Pi 5 (8GB) |
| **Camera Capture** | ADB (Android Debug Bridge) |
| **Backend API** | Python 3.10+, Flask 3.0, Flask-CORS |
| **Computer Vision** | OpenCV 4.8, Ultralytics YOLOv8 |
| **Deep Learning** | PyTorch 2.0+, torchvision, HuggingFace Transformers |
| **OCR** | TrOCR (Microsoft), Tesseract 5 |
| **AI API** | Google Gemini 2.5 Flash Lite |
| **Document Generation** | Pandoc + XeLaTeX |
| **Frontend** | Next.js 16, React 19, TypeScript |
| **UI Components** | shadcn/ui, Tailwind CSS 4, Framer Motion |
| **Math Rendering** | KaTeX |
| **Data Fetching** | SWR |

---

## 📊 Performance Benchmarks

| Component | Platform | Speed |
|-----------|----------|-------|
| Image Crop + Dewarp | Pi 5 | ~0.5s/page |
| YOLO Detection | Pi 5 (CPU) | ~2–5s/page |
| TrOCR Inference | Pi 5 (CPU) | ~15–40s/formula |
| Tesseract OCR | Pi 5 | ~1–3s/page |
| Gemini API | Cloud | ~2–5s/page |
| Pandoc PDF (full book) | Pi 5 | ~30–90s |

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Submitting bug reports
- Proposing new features
- Opening pull requests
- Code style standards

---

## 🔒 Security

Please read [SECURITY.md](SECURITY.md) for our security policy and how to responsibly disclose vulnerabilities.

**Key security notes:**
- Never commit `.env` files — they contain API keys
- The `.gitignore` is pre-configured to exclude sensitive files
- API keys rotate regularly — see [SECURITY.md](SECURITY.md) for rotation procedures

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE.md](LICENSE.md) for details.

---

## 🙏 Acknowledgements

- **IBEM Dataset** — Anitei et al., Pattern Recognition Letters, 2023 ([Zenodo](https://doi.org/10.5281/zenodo.4757865))
- **Im2LaTeX-100K** — Kanervisto, A., Zenodo, 2016 ([DOI](https://doi.org/10.5281/zenodo.56198))
- **TrOCR** — Microsoft Research ([HuggingFace](https://huggingface.co/microsoft/trocr-base-printed))
- **Ultralytics YOLOv8** — [ultralytics.com](https://ultralytics.com)
- **page-dewarp** — [PyPI](https://pypi.org/project/page-dewarp/)
- **Academic Paper** — *An Automated Academic Book Scanner With Deep Learning-Powered Math Expression Detection and Recognition*, IEEE Access, DOI: [10.1109/ACCESS.2025.3638780](https://doi.org/10.1109/ACCESS.2025.3638780)

---

<div align="center">

Made with ❤️ at **United International University (UIU)**

⭐ Star this repo if SmartScan helped you!

</div>
