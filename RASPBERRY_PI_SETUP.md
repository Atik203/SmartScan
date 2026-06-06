# 🍓 SmartScan — Raspberry Pi 5 (8GB) Setup Guide

> **Role of the Pi 5:** Runs everything — serial listener, ADB capture, Flask backend (OCR/ML/PDF).
> The laptop only opens the browser.

---

## ✅ Step 0 — OS & Initial Config

Use **Raspberry Pi OS (64-bit, Bookworm)**.

```bash
# Update system first
sudo apt update && sudo apt upgrade -y

# Enable SSH (if not already on)
sudo systemctl enable ssh && sudo systemctl start ssh

# Find your Pi's IP (write this down — you'll need it)
hostname -I
```

---

## 🛠️ Step 1 — Install System Dependencies

```bash
# Core tools
sudo apt install -y git curl wget nano python3-pip python3-venv

# ADB (for phone capture via USB)
sudo apt install -y android-tools-adb

# OpenCV system libs
sudo apt install -y libopencv-dev python3-opencv

# Tesseract OCR (Path A — text-only pages)
sudo apt install -y tesseract-ocr tesseract-ocr-eng

# Pandoc + XeLaTeX (for PDF compilation)
sudo apt install -y pandoc texlive-xetex texlive-fonts-recommended texlive-latex-extra

# Verify all installed
adb version
tesseract --version
pandoc --version
xelatex --version
```

> ⏱️ `texlive-xetex` takes ~5-10 min to download. Run once then it's done.

---

## 🔌 Step 2 — ADB Setup for Phone

```bash
# Enable USB debugging on the Redmi Note 13 Pro:
#   Settings → About Phone → tap MIUI version 7× → Developer Options → USB Debugging ON
# Connect via USB, then:
adb devices
# Expected output:
#   868130a1       device    ← Redmi Note 13 Pro
#
# Capture mode: ONE phone captures BOTH open book pages in a single landscape shot.
# The capture script rotates the image 90° clockwise and splits at the midpoint,
# producing page_001.jpg + page_002.jpg per capture.

# If you see "unauthorized" — check the phone screen and tap "Allow"

# Add yourself to plugdev group (so adb works without sudo)
sudo usermod -aG plugdev $USER
# Reboot after this: sudo reboot
```

---

## 📂 Step 3 — Clone and Set Up the Project

```bash
# Clone from GitHub
git clone https://github.com/YOUR_REPO/SmartScan.git ~/SmartScan
cd ~/SmartScan

# OR: rsync from your Windows laptop (run from Windows PowerShell):
# rsync -avz E:/PROJECT/SmartScan/ pi@192.168.1.100:~/SmartScan/ --exclude node_modules --exclude .venv --exclude .git

# Create directories needed by the pipeline
mkdir -p ~/SmartScan/SmartScan_Captures
mkdir -p ~/SmartScan/output/pages
mkdir -p ~/SmartScan/output/pdf
mkdir -p ~/SmartScan/models
```

---

## 🐍 Step 4 — Python Virtual Environment

```bash
cd ~/SmartScan/backend

python3 -m venv .venv
source .venv/bin/activate

# Install all dependencies (~5-15 min on Pi 5)
pip install --upgrade pip
pip install -r requirements.txt
```

> **RAM tip (8GB Pi 5):** TrOCR model loads ~2GB. Flask + TrOCR + Pandoc peak ~3.5GB. 8GB is fine.

### Fix config.py for Linux (Tesseract is in PATH — no full path needed):

```bash
nano ~/SmartScan/backend/config.py
```

Find this line and update it:
```python
# Change from:
TESSERACT_CMD = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")

# Change to:
TESSERACT_CMD = os.getenv("TESSERACT_CMD", "")   # empty = auto on Linux ✅
```

---

## 🔑 Step 5 — Environment Variables (.env)

```bash
cd ~/SmartScan/backend
cp .env.example .env
nano .env
```

Fill in:
```env
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.0-flash-lite
TESSERACT_CMD=
PI_SAVE_PATH=/home/pi/SmartScan/SmartScan_Captures
```

> Replace `your_gemini_key_here` with your actual key from https://aistudio.google.com

---

## 🤖 Step 6 — After Colab Training: Place Model Files

After training on Google Colab Pro, download and transfer to Pi:

### From your Windows laptop (PowerShell):

```powershell
# After downloading from Google Drive to your laptop:

# YOLOv8 best.pt:
scp E:\Downloads\best.pt pi@192.168.1.100:~/SmartScan/models/best.pt

# TrOCR final folder (entire folder):
scp -r E:\Downloads\trocr_final\ pi@192.168.1.100:~/SmartScan/models/trocr-latex/
```

### Final `models/` structure on Pi:

```
~/SmartScan/models/
├── best.pt                     ← YOLOv8 (from Google Drive: Smart_Scan/Detection_Model/yolo_runs/math_detector/weights/best.pt)
├── fasterrcnn_math_detector.pt ← Faster R-CNN fallback
└── trocr-latex/                ← (from Google Drive: Smart_Scan/Recognition_Model/trocr_final/)
    ├── config.json
    ├── pytorch_model.bin
    ├── tokenizer_config.json
    └── ...
```

### Verify models load:

```bash
cd ~/SmartScan/backend
source .venv/bin/activate
python3 -c "from trocr_inference import get_trocr_model; get_trocr_model(); print('TrOCR OK')"
python3 -c "from config import YOLO_MODEL_PATH; import os; print('YOLO:', os.path.exists(YOLO_MODEL_PATH))"
```

---

## 🔌 Step 7 — Arduino Serial Setup

```bash
# Find the Arduino serial port
ls /dev/ttyUSB* /dev/ttyACM*
# Typically: /dev/ttyUSB0 or /dev/ttyACM0

# Add user to dialout group (run once, then reboot)
sudo usermod -aG dialout $USER
sudo reboot

# Update auto3.py if port differs from /dev/ttyUSB0:
nano ~/SmartScan/raspberrypi\ code/auto3.py
# Change: SERIAL_PORT = "/dev/ttyUSB0"
```

---

## 🚀 Step 8 — Run the Full System

Open **3 terminals** (or use `tmux`):

### Terminal 1 — Serial Listener (Arduino bridge):

```bash
cd ~/SmartScan/raspberrypi\ code
source ~/SmartScan/backend/.venv/bin/activate
python3 auto3.py
# Waits for "CAPTURE" from Arduino → triggers capture script
```

### Terminal 2 — Flask Backend:

```bash
cd ~/SmartScan/backend
source .venv/bin/activate
python3 app.py
# → Flask API: http://0.0.0.0:5000
# → Dashboard accessible at: http://PI_IP:5000
```

### Terminal 3 — (Optional) Quick test:

```bash
curl http://localhost:5000/health
# Should return JSON with model_loaded, tesseract, pandoc status
```

### Using tmux (recommended for demo):

```bash
sudo apt install -y tmux

tmux new-session -s smartscan
# Ctrl+B, % to split pane
# Ctrl+B, " to split horizontal
# Run auto3.py in pane 1, app.py in pane 2
```

---

## 🖥️ Step 9 — Access Dashboard from Laptop

On your Windows laptop, set the Pi IP in the frontend:

```
smartscan-web/.env.local:
NEXT_PUBLIC_FLASK_URL=http://192.168.1.100:5000
```

Then:
```powershell
cd E:\PROJECT\SmartScan\smartscan-web
npm run dev
# Open: http://localhost:3000
```

The UI runs on your laptop, Flask runs on the Pi. ✅

---

## 🔄 Step 10 — Auto-start on Boot (Optional, for Demo)

```bash
# Create a systemd service so Flask starts automatically
sudo nano /etc/systemd/system/smartscan.service
```

Paste:
```ini
[Unit]
Description=SmartScan Flask Backend
After=network.target

[Service]
User=pi
WorkingDirectory=/home/pi/SmartScan/backend
ExecStart=/home/pi/SmartScan/backend/.venv/bin/python3 app.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable smartscan
sudo systemctl start smartscan
sudo systemctl status smartscan
```

---

## 📋 Quick Checklist

- [ ] Raspberry Pi OS 64-bit Bookworm installed
- [ ] `sudo apt install` all dependencies (adb, tesseract, pandoc, texlive-xetex)
- [ ] ADB recognizes Redmi Note 13 Pro (`adb devices` shows `868130a1`)
- [ ] Project cloned to `~/SmartScan/`
- [ ] Python venv created + `pip install -r requirements.txt` done
- [ ] `.env` created with `GEMINI_API_KEY`
- [ ] `config.py` updated: `TESSERACT_CMD = ""`
- [ ] `models/best.pt` placed after Colab training
- [ ] `models/trocr-latex/` folder placed after Colab training
- [ ] `/dev/ttyUSB0` confirmed (or updated in `auto3.py`)
- [ ] `python3 app.py` starts without errors
- [ ] `curl http://localhost:5000/health` returns `model_loaded: true`
- [ ] Dashboard loads at `http://PI_IP:5000` from browser
