# 💻 SmartScan — Laptop (Windows) Setup Guide

> **Role of the Laptop:** Runs Next.js frontend (`npm run dev`). Talks to Flask on Pi 5 over WiFi.
> During development you may also run Flask on the laptop for testing.

---

## ✅ Step 0 — Prerequisites Check

Open PowerShell and verify these are already installed:

```powershell
python --version        # Need 3.10+
node --version          # Need 18+
npm --version
git --version
```

---

## 📦 Step 1 — Clone / Open the Project

```powershell
# If not cloned yet:
git clone https://github.com/YOUR_REPO/SmartScan.git E:\PROJECT\SmartScan
cd E:\PROJECT\SmartScan
```

---

## 🌐 Step 2 — Frontend Setup (Next.js)

```powershell
cd E:\PROJECT\SmartScan\smartscan-web
npm install
```

### Point frontend to Pi 5 backend:

Create the file `smartscan-web\.env.local`:

```env
NEXT_PUBLIC_FLASK_URL=http://192.168.1.100:5000
```

> **Replace `192.168.1.100`** with your Pi 5's actual IP.
> Find it on the Pi with: `hostname -I`

### Start the frontend:

```powershell
npm run dev
# Open: http://localhost:3000
```

---

## 🐍 Step 3 — Backend Python Env (for local testing only)

> Skip this if Flask runs on the Pi (recommended). Only needed for local testing.

```powershell
cd E:\PROJECT\SmartScan\backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Set up environment variables:

```powershell
copy .env.example .env
notepad .env
```

Add your key:
```
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.0-flash-lite
```

---

## 📄 Step 4 — Pandoc + LaTeX (PDF Compilation)

> Only needed if running Flask **on laptop**. Skip if Flask runs on Pi 5.

### Check if TeX Live is already installed:

```powershell
xelatex --version
pandoc --version
```

### If NOT installed — Option A: winget

```powershell
winget install JohnMacFarlane.Pandoc
# For LaTeX — choose ONE:
winget install MiKTeX.MiKTeX          # Smaller, auto-downloads packages on demand
# OR
# TeX Live: https://tug.org/texlive/windows.html (Full install ~5GB, offline)
```

### If TeX Live IS already installed (check):

```powershell
# Find where it's installed:
where.exe xelatex
# Should print something like: C:\texlive\2024\bin\windows\xelatex.exe
# If it works — you're done! No reinstall needed.
```

### Verify after install (restart PowerShell first):

```powershell
pandoc --version
xelatex --version
```

> **MiKTeX tip:** First time you run `GET /book/pdf`, MiKTeX will auto-download
> LaTeX packages and prompt you. Click "Install for all users" and wait ~2 min.
> All future PDF compilations will be instant.

---

## 🔍 Step 5 — Tesseract OCR (for local Flask only)

> Skip if Flask runs on Pi 5 (Tesseract is installed there via apt).

```powershell
winget install UB-Mannheim.TesseractOCR
# Installs to: C:\Program Files\Tesseract-OCR\
# config.py already points there by default ✅
```

### Verify:

```powershell
& 'C:\Program Files\Tesseract-OCR\tesseract.exe' --version
```

---

## 🤖 Step 6 — After Colab Training: Where to Place Model Files

After training completes on Google Colab Pro, download and place files here:

### YOLOv8 Detection Model (`best.pt`):

```
Google Drive path after training:
  Smart_Scan/Detection_Model/yolo_runs/math_detector/weights/best.pt

Download → paste to:
  E:\PROJECT\SmartScan\models\best.pt
```

### TrOCR Recognition Model (`trocr_final/`):

```
Google Drive path after training:
  Smart_Scan/Recognition_Model/trocr_final/   (entire folder)

Download entire folder → paste to:
  E:\PROJECT\SmartScan\models\trocr-latex\
```

Final `models/` structure should look like:

```
E:\PROJECT\SmartScan\models\
├── best.pt                     ← YOLOv8 weights
├── fasterrcnn_math_detector.pt ← Faster R-CNN fallback (already there)
└── trocr-latex\
    ├── config.json
    ├── pytorch_model.bin
    ├── tokenizer_config.json
    ├── vocab.json
    └── ...
```

> If you're running Flask on **Pi 5**, rsync the models folder to the Pi after downloading:
> ```powershell
> rsync -avz E:\PROJECT\SmartScan\models\ pi@192.168.1.100:~/SmartScan/models/
> ```

---

## 🚀 Step 7 — Start for Demo Day

```powershell
# 1. Start Next.js frontend (laptop):
cd E:\PROJECT\SmartScan\smartscan-web
npm run dev
# → http://localhost:3000

# 2. Flask is running on Pi 5 (see Pi setup guide)
# Frontend auto-connects via NEXT_PUBLIC_FLASK_URL
```

---

## 📋 Quick Checklist

- [ ] `npm install` done in `smartscan-web/`
- [ ] `smartscan-web/.env.local` created with Pi IP
- [ ] `npm run dev` starts without errors
- [ ] Models placed in `E:\PROJECT\SmartScan\models\` after Colab training
- [ ] Pandoc + xelatex installed (if running Flask locally)
- [ ] Tesseract installed at `C:\Program Files\Tesseract-OCR\` (if local Flask)
- [ ] Browser opens `http://localhost:3000` and dashboard loads
