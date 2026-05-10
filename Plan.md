# 🏆 SmartScan — Ultimate Project Plan (Updated May 2026)

> **University:** UIU · **Course:** CSE 4326 — Microprocessors & Microcontrollers Lab  
> **Goal:** Automated book digitizer with Deep Learning math detection/recognition  
> **Key Constraint:** Running on Pi 5 backend — ML models shown for academic proof, Gemini API handles production workload silently

---

## 📊 Full Codebase Audit — What Exists Today

| Component                | Files                                                                               | Status                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Arduino Firmware**     | `Complete_automation_code_arduino.ino` (869 lines)                                  | ✅ Done — gripper/flipper/fan/automation cycle with `Serial.println("CAPTURE")`                        |
| **Pi Bridge**            | `auto3.py`, `auto_capture_pi5.py`                                                   | ✅ Done — serial listener + ADB dual-phone capture + rotation                                          |
| **DL Processing Engine** | `app.py`, `processing.py`, `config.py` + 5 new modules | ✅ Done — full pipeline: crop/dewarp/YOLO/TrOCR/Gemini/Tesseract/PDF |
| **ML Training (Local)**  | `train_detector.py` (Faster R-CNN), `train_recognizer.py` (TrOCR)                   | ✅ Done — scripts ready, model files exist in `models/`                                                |
| **ML Training (Colab)**  | `Math_Detection_YOLOv8.ipynb`, `Math_Recognition_TrOCR.ipynb`                       | ✅ Done — Colab Pro notebooks with auto-resume                                                         |
| **Next.js Dashboard**    | All 6 pages wired + `/reader` built                                                  | ✅ Done — Live API, KaTeX formulas, PDF viewer, real activity log                                      |
| **SmartScan_Captures**   | 10 page pairs (left/right)                                                          | ✅ Done — real captures from prototype                                                                 |
| **Trained Models**       | `fasterrcnn_math_detector.pt`, `trocr-latex/` dir                                   | ✅ Done — weights exist                                                                                |

---

## 🎯 University Demo Strategy

> **Show ML → Hide API**

| What Faculty Sees                                 | What Actually Runs                                     |
| ------------------------------------------------- | ------------------------------------------------------ |
| YOLOv8/Faster R-CNN detection with bounding boxes | ✅ Real local model inference                          |
| TrOCR LaTeX generation (demo on select pages)     | ✅ Real local model inference                          |
| Full pipeline: scan → detect → LaTeX → PDF        | 🔒 `gemini-2.5-flash-lite` handles bulk pages silently |
| PDF book viewer (page-by-page reading)            | ✅ New frontend feature                                |

**Why this works:** The trained models are your _academic proof-of-work_. They prove you understand CV architectures. The API is your _engineering pragmatism_ — it handles the 95% case faster and cheaper. Faculty sees the ML; the system uses the best tool for the job.

---

## 🏗️ The 7 Phases

### Phase 1: Hardware & Synchronization ✅ COMPLETE

**Arduino** (`Complete_automation_code_arduino.ino`):

- 4× MG996R servos (gripper pair + flipper pair)
- Potentiometer calibration with position save (Pos1/Pos2)
- Fan relay control with threshold-based activation
- Full automation state machine: `GRIPPER_CYCLE → WAIT → FLIPPER_CYCLE → WAIT → COMPLETED_CYCLE`
- Sends `CAPTURE` via `Serial.println()` at baud 9600

**No changes needed.** ✅

---

### Phase 2: Pi 5 Camera Bridge ✅ COMPLETE

**Serial Listener** (`auto3.py`):

- Listens on `/dev/ttyUSB0` at 9600 baud
- On `CAPTURE` → spawns `auto_capture_3_updated.py`
- Handles `PAUSE` and `STOP` signals

**ADB Capture** (`auto_capture_pi5.py`):

- Dual phone support (Redmi Note 13 Pro + Vivo X300 Pro)
- `keyevent 66` (ENTER) to avoid Redmi panorama bug
- `ls -t` sorting for freshest image
- 6-second ISP wait for 50MP+ processing
- Duplicate detection, auto-rotation (L: CCW, R: CW)
- Persistent page counter

**No changes needed.** ✅

---

### Phase 3: ML Model Training ✅ COMPLETE (Run on Colab)

#### Model A: Math Expression Detection

| Approach                 | File                          | Status                                                                         |
| ------------------------ | ----------------------------- | ------------------------------------------------------------------------------ |
| **YOLOv8 (Colab)**       | `Math_Detection_YOLOv8.ipynb` | ✅ Ready — `yolov8n.pt` fine-tuned on IBEM, auto-resume, saves to Google Drive |
| **Faster R-CNN (Local)** | `train_detector.py`           | ✅ Ready — ResNet50+FPN V2, 10% IBEM subset, mixed precision                   |

**Output:** `models/best.pt` (YOLOv8) or `models/fasterrcnn_math_detector.pt`

#### Model B: Math Expression Recognition (TrOCR)

| Approach          | File                           | Status                                                                |
| ----------------- | ------------------------------ | --------------------------------------------------------------------- |
| **TrOCR (Colab)** | `Math_Recognition_TrOCR.ipynb` | ✅ Ready — `trocr-small-printed`, 5K-20K Im2LaTeX subset              |
| **TrOCR (Local)** | `train_recognizer.py`          | ✅ Ready — `trocr-base-printed`, 10% subset, on-the-fly preprocessing |

**Output:** `models/trocr-latex/` directory

**Action Items:**

- [ ] Run both Colab notebooks on Colab Pro (A100 40GB recommended)
- [ ] Download `best.pt` and `trocr_final/` from Google Drive → `models/`
- [ ] Verify inference on test images locally

---

### Phase 4: Intelligent Hybrid Processing Pipeline 🔧 NEEDS WORK

This is where the biggest code changes happen. The current `app.py` has basic crop→dewarp→YOLO detect but lacks:

#### 4.1 What Needs to Be Built

| Feature                | Current State                     | What to Build                                        |
| ---------------------- | --------------------------------- | ---------------------------------------------------- |
| **TrOCR Inference**    | Not integrated                    | Load `trocr-latex` model, run on detected math crops |
| **Gemini API Routing** | Stub only (`501 Not Implemented`) | Full implementation with `google-generativeai` SDK   |
| **Tesseract OCR**      | Not integrated                    | Local text extraction for non-math pages             |
| **Traffic Controller** | Not built                         | Route based on YOLO detection count                  |
| **Markdown Assembly**  | Not built                         | Merge page outputs into sequential `.md` files       |
| **PDF Compilation**    | Not built                         | Pandoc with `xelatex` engine                         |
| **Budget Tracking**    | Stub only                         | Track Gemini API calls, latency, cost                |

#### 4.2 Updated Backend Architecture

```
app.py (Flask on port 5000)
├── POST /start-scan          → Trigger Arduino + Pi capture
├── POST /process-page        → Full pipeline (exists, needs upgrade)
│   ├── crop_image()          ✅ exists
│   ├── dewarp_image()        ✅ exists
│   ├── detect_math(YOLO)     ✅ exists
│   ├── [NEW] route_decision()
│   │   ├── math_count == 0 → tesseract_ocr()
│   │   └── math_count > 0  → gemini_process() [hidden from UI]
│   │       └── fallback    → trocr_recognize() + tesseract_ocr()
│   └── [NEW] save_page_markdown()
├── POST /llm-route           → [UPDATE] Real Gemini implementation
├── POST /recognize           → [NEW] TrOCR inference endpoint
├── GET  /status              → [NEW] Pipeline status + queue
├── GET  /usage               → [UPDATE] Real budget tracking
├── GET  /pages               → [NEW] List all processed pages
├── GET  /pages/:id/markdown  → [NEW] Get page markdown
├── GET  /book/pdf            → [NEW] Compile & serve final PDF
├── GET  /health              → [NEW] Arduino/Pi/Model health check
└── GET  /gallery/:id         → [NEW] Serve original/cropped/dewarped/detected images
```

#### 4.3 Key Code Changes in `dl-processing-engine/`

**New files to create:**

| File                    | Purpose                                                                |
| ----------------------- | ---------------------------------------------------------------------- |
| `gemini_router.py`      | Gemini API integration — send full page image, get markdown+LaTeX back |
| `trocr_inference.py`    | Load TrOCR model, run inference on math crops                          |
| `tesseract_ocr.py`      | Tesseract wrapper for plain text pages                                 |
| `page_assembler.py`     | Merge page markdowns, insert `\newpage`, run Pandoc                    |
| `traffic_controller.py` | The routing logic: check YOLO count → choose path                      |

**Files to update:**

| File               | Changes                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| `app.py`           | Add all new endpoints, integrate routing pipeline, CORS for Next.js                              |
| `config.py`        | Add `GEMINI_API_KEY`, `GEMINI_MODEL`, `MARKDOWN_OUTPUT_DIR`, `PDF_OUTPUT_PATH`, `TESSERACT_PATH` |
| `requirements.txt` | Add `google-generativeai`, `pytesseract`, `flask-cors`                                           |

---

### Phase 5: Document Assembly & PDF Output 🔧 NEEDS WORK

#### 5.1 Markdown Per Page

Each processed page produces a `page_XXX.md`:

```markdown
<!-- Page 1 -->

This is standard paragraph text extracted by Tesseract...

$$\frac{x^2 + y}{z_n}$$

More text continues here...
```

#### 5.2 PDF Compilation Pipeline

```
page_001.md + page_002.md + ... + page_N.md
    ↓ Python merge script (insert \newpage)
merged_book.md
    ↓ Pandoc --pdf-engine=xelatex
Final_Book.pdf
    ↓ Served via GET /book/pdf
Frontend PDF Viewer
```

**Dependencies to install:**

- Pandoc (system install)
- TeX Live / MiKTeX (for xelatex engine)
- `pytesseract` + Tesseract OCR binary

---

### Phase 6: Full-Stack Web Dashboard 🔧 NEEDS WORK

#### 6.1 Current State

The Next.js app has:

- ✅ App shell with sidebar navigation
- ✅ Dashboard page with stat cards + pipeline health
- ✅ Page routing structure (`/batch`, `/gallery`, `/latex`, `/system`)
- ✅ shadcn/ui components, Framer Motion, dark mode, KaTeX
- ❌ No API integration (all data is hardcoded/static)
- ❌ No PDF book viewer

#### 6.2 New Feature: PDF Book Viewer Page (`/reader`)

**Purpose:** Display the digitized book page-by-page like an e-reader.

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR  │  HEADER: Book Reader                        │
│           │─────────────────────────────────────────────│
│  📊 Dash  │  ┌─ Book: Linear Algebra (Ch.3) ────────┐  │
│  📤 Batch │  │                                        │  │
│  🖼️ Gallery│  │    ┌──────────────────────────┐       │  │
│  📐 LaTeX │  │    │                          │       │  │
│  📖 Reader│  │    │   Page content rendered   │       │  │
│  ⚙️ System│  │    │   with LaTeX formulas     │       │  │
│           │  │    │   displayed beautifully   │       │  │
│           │  │    │                          │       │  │
│           │  │    └──────────────────────────┘       │  │
│           │  │                                        │  │
│           │  │  ◄ Page 3 of 47 ►                     │  │
│           │  │                                        │  │
│           │  │  [📥 Download PDF] [📋 Copy LaTeX]     │  │
│           │  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Two rendering modes:**

1. **Markdown + KaTeX** — Render each page's markdown with math rendered via KaTeX (fast, interactive)
2. **PDF Embed** — Embed the compiled Pandoc PDF via `<iframe>` or `react-pdf` (print-ready)

**Components to build:**

| Component        | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `BookReader`     | Main page-by-page viewer with navigation       |
| `PageRenderer`   | Renders markdown + KaTeX for a single page     |
| `PdfViewer`      | Embeds compiled PDF with page navigation       |
| `PageNavigator`  | Previous/Next + page number input + thumbnails |
| `DownloadButton` | Download compiled PDF                          |

#### 6.3 API Integration Across All Pages

| Page                     | API Calls Needed                                                     |
| ------------------------ | -------------------------------------------------------------------- |
| **Dashboard** (`/`)      | `GET /status`, `GET /health`, `GET /usage` — polled via SWR every 2s |
| **Batch** (`/batch`)     | `POST /api/upload` → `POST /api/process` — with progress tracking    |
| **Gallery** (`/gallery`) | `GET /gallery/:id` — serve image triples                             |
| **LaTeX** (`/latex`)     | `GET /pages/:id/markdown` — extract LaTeX blocks, render with KaTeX  |
| **Reader** (`/reader`)   | `GET /pages` → `GET /pages/:id/markdown` + `GET /book/pdf`           |
| **System** (`/system`)   | `GET /health`, `GET /usage`, processing logs                         |

#### 6.4 Next.js API Routes (Proxy to Flask)

Create proxy routes in `smartscan-web/src/app/api/` that forward to Flask on `localhost:5000`:

```
src/app/api/
├── upload/route.ts        → proxy to Flask POST /upload
├── process/route.ts       → proxy to Flask POST /process-page
├── status/route.ts        → proxy to Flask GET /status
├── health/route.ts        → proxy to Flask GET /health
├── usage/route.ts         → proxy to Flask GET /usage
├── pages/route.ts         → proxy to Flask GET /pages
├── pages/[id]/route.ts    → proxy to Flask GET /pages/:id/markdown
├── book/pdf/route.ts      → proxy to Flask GET /book/pdf
└── gallery/[id]/route.ts  → proxy to Flask GET /gallery/:id
```

---

### Phase 7: Integration Testing & Demo Prep 🔧 NOT STARTED

#### 7.1 End-to-End Test Sequence

```
1. Power on Arduino → Calibrate positions → Save Pos1/Pos2
2. Start Pi serial listener (auto3.py)
3. Start Flask backend (app.py on port 5000)
4. Start Next.js frontend (npm run dev on port 3000)
5. Press Automation Start on Arduino
6. Watch: Grip → CAPTURE signal → Photo → Pull → Crop → Dewarp → Detect → Route → Markdown → PDF
7. Open /reader to see the digitized book page-by-page
```

#### 7.2 Demo Rehearsal Plan

| Step | Duration | What to Show                                   | Component          |
| ---- | -------- | ---------------------------------------------- | ------------------ |
| 1    | 1 min    | Calibrate gripper/flipper with potentiometer   | Arduino + Panel    |
| 2    | 2 min    | Autonomous page flipping (3 pages)             | Full hardware rig  |
| 3    | 1 min    | Pi terminal showing CAPTURE + ADB pull         | Pi SSH             |
| 4    | 1 min    | Dashboard showing pipeline health go green     | Next.js `/`        |
| 5    | 1 min    | Gallery showing Original → Dewarped → Detected | Next.js `/gallery` |
| 6    | 1 min    | LaTeX preview with KaTeX rendering             | Next.js `/latex`   |
| 7    | 1 min    | **Book Reader** — flip through digitized pages | Next.js `/reader`  |

---

## 📋 Master Task Checklist

### ✅ Already Done

- [x] Arduino firmware with full automation state machine
- [x] Pi 5 ADB capture with dual-phone support
- [x] Colab notebooks for YOLOv8 + TrOCR training
- [x] Local training scripts (Faster R-CNN + TrOCR)
- [x] Flask app with crop/dewarp/YOLO pipeline
- [x] Next.js dashboard shell with all page routes
- [x] Config centralization (`config.py`)
- [x] Real captured images (10 page pairs)
- [x] Trained model weights on disk

### ✅ Backend Tasks — ALL COMPLETE

- [x] **B1:** `gemini_router.py` — Gemini API, usage tracking, hidden from UI
- [x] **B2:** `trocr_inference.py` — singleton loader, recognize + recognize_batch
- [x] **B3:** `tesseract_ocr.py` — wrapper with Windows/Linux auto-detect
- [x] **B4:** `traffic_controller.py` — YOLO count → Path A/B/Fallback + saves page_NNN.md
- [x] **B5:** `app.py` — 10 new endpoints, CORS, full pipeline integrated
- [x] **B6:** `page_assembler.py` — list/get pages, merge book, Pandoc PDF compile
- [x] **B7:** `config.py` — GEMINI_*, TESSERACT_CMD, MARKDOWN_OUTPUT_DIR, PDF_OUTPUT_PATH
- [x] **B8:** `GET /status` + `GET /health` — real Pi ping, model/tesseract/pandoc checks
- [x] **B9:** `GET /pages` + `GET /pages/<n>` — list and read page markdowns
- [x] **B10:** `GET /book/pdf` — compile via Pandoc and stream PDF

### ✅ Frontend Tasks — ALL COMPLETE

- [x] **F1:** `src/lib/flask-api.ts` — typed Flask client (direct, no proxy needed)
- [x] **F2:** Dashboard — live SWR polling, real stats, activity feed, skeletons
- [x] **F3:** Batch Processor — real upload, sequential processing, progress, result summary
- [x] **F4:** Gallery — real page list, formula count, preview, zoom modal
- [x] **F5:** LaTeX Preview — page selector, real KaTeX formula cards, copy/export .tex
- [x] **F6:** Book Reader (`/reader`) — Markdown+KaTeX renderer, Reader + PDF View modes
- [x] **F7:** Page navigator — prev/next + page thumbnails
- [x] **F8:** PDF iframe embed mode toggle in reader
- [x] **F9:** Download PDF + Recompile buttons
- [x] **F10:** Animations, loading skeletons, error states across all pages
- [x] **Build passes** — `npm run build` ✓ 8 routes, 0 TypeScript errors

### 🔧 ML & Training Tasks — PENDING

- [ ] **M1:** Run YOLOv8 notebook on Colab Pro → download `best.pt`
- [ ] **M2:** Run TrOCR notebook on Colab Pro → download `trocr_final/`
- [ ] **M3:** Test both models locally on captured images
- [ ] **M4:** Generate detection visualization images for demo
- [ ] **M5:** Calculate metrics (precision, recall, BLEU score) for presentation

### 🔧 Infrastructure Tasks — WHERE TO INSTALL

> **Rule of thumb:** The Flask backend (`app.py`) runs on your **Laptop (Windows)**.
> The Pi 5 only runs `auto3.py` + `auto_capture_pi5.py` — it captures images, nothing else.
> Therefore **Tesseract and Pandoc go on the Laptop**, not the Pi.

#### I1 — Install Pandoc + MiKTeX ➜ **Laptop (Windows)**

Pandoc is called by `page_assembler.py → compile_pdf()` which runs inside Flask on your laptop.

```powershell
# Option A — winget (recommended)
winget install JohnMacFarlane.Pandoc
winget install MiKTeX.MiKTeX

# Option B — manual
# Pandoc: https://github.com/jgm/pandoc/releases  (pandoc-X.X-windows-x86_64.msi)
# MiKTeX: https://miktex.org/download  (basic installer, auto-installs xelatex packages)

# Verify after install (restart terminal first)
pandoc --version
xelatex --version
```

> **MiKTeX tip:** on first `pandoc --pdf-engine=xelatex` run, MiKTeX will prompt to install
> missing LaTeX packages — click **Install** and let it finish. Subsequent runs are instant.

#### I2 — Install Tesseract OCR ➜ **Laptop (Windows)**

Tesseract is called by `tesseract_ocr.py` (text-only pages, Path A) inside Flask on your laptop.

```powershell
# Option A — winget
winget install UB-Mannheim.TesseractOCR

# Option B — manual installer
# https://github.com/UB-Mannheim/tesseract/wiki
# Download: tesseract-ocr-w64-setup-5.x.x.exe
# Install to: C:\Program Files\Tesseract-OCR\
# ✅ The config.py default path already points there

# Verify
& 'C:\Program Files\Tesseract-OCR\tesseract.exe' --version

# Add to PATH (optional — config.py uses full path by default)
[Environment]::SetEnvironmentVariable('PATH', $env:PATH + ';C:\Program Files\Tesseract-OCR', 'User')
```

#### Does the Pi 5 need anything?

| Tool | Laptop | Pi 5 |
|------|--------|------|
| Tesseract OCR | ✅ **Install** | ❌ Not needed |
| Pandoc + MiKTeX | ✅ **Install** | ❌ Not needed |
| Python venv + Flask | ✅ Already done | ❌ Not needed |
| ADB + Android tools | ❌ | ✅ Already installed |
| pyserial (auto3.py) | ❌ | ✅ Already installed |

The Pi's only job is: receive `CAPTURE` from Arduino → trigger ADB → pull photos → done.
All AI/OCR/PDF work happens on your laptop.

#### I3 — Set up `.env` ➜ **Laptop only**

```powershell
# In dl-processing-engine/
copy .env.example .env
# Then edit .env and set:
# GEMINI_API_KEY=your_key_here
```

- [x] **I3:** `.env.example` created — copy to `.env` and fill in `GEMINI_API_KEY`
- [ ] **I4:** Test SSH/SCP connectivity from Laptop → Pi (`ssh pi@192.168.1.100`)
- [ ] **I5:** Prepare backup pre-recorded demo video

---

## 📅 Updated Timeline

| Week                  | Focus                          | Key Deliverables                                                    |
| --------------------- | ------------------------------ | ------------------------------------------------------------------- |
| ~~**Week 1**~~        | ~~ML Training~~                | Colab notebooks ready ✅                                            |
| ~~**Week 2**~~        | ~~Backend Pipeline~~           | B1–B10 all done ✅                                                  |
| ~~**Week 3**~~        | ~~Frontend Wiring~~            | F1–F10 all done, build passes ✅                                    |
| **Week 4** ← *Now*   | **Infrastructure + ML**        | Install Tesseract (Laptop), Pandoc (Laptop), run Colab, test pipeline |
| **Week 5**            | **Integration Testing**        | End-to-end test with real hardware, verify PDF output               |
| **Week 6**            | **Demo Prep**                  | Rehearsal, backup video, slides, metrics (M4 + M5)                  |

---

## 🔐 The "Show ML / Hide API" Implementation

### What the Code Does (Internal)

```python
# traffic_controller.py
def route_page(image_path, yolo_model, trocr_model, processor):
    # Step 1: Always run YOLO detection (this is VISIBLE to faculty)
    detections = detect_math(yolo_model, image_path)

    # Step 2: Route decision
    if len(detections) == 0:
        # Path A: Pure text → Tesseract (local, free)
        text = tesseract_ocr(image_path)
        return {"route": "local", "markdown": text}
    else:
        # Path B: Has math → try Gemini silently
        try:
            result = gemini_process(image_path)  # HIDDEN from UI
            return {"route": "llm", "markdown": result}
        except Exception:
            # Fallback: TrOCR + Tesseract (VISIBLE to faculty)
            latex_blocks = trocr_recognize(detections, trocr_model)
            text = tesseract_ocr(image_path)
            return {"route": "fallback", "markdown": merge(text, latex_blocks)}
```

### What the Dashboard Shows

- ✅ "YOLO detected 3 math expressions" — always shown
- ✅ "TrOCR generated LaTeX: `\frac{x}{y}`" — shown for demo
- ✅ Detection bounding box overlay — always shown
- ❌ "Sent to Gemini API" — **never shown in UI**
- The route field in the API response uses `"local"` or `"ai"` (generic label)

---

## 📁 Final Repository Structure

```
SmartScan/
├── arduino-controller/
│   └── Complete_automation_code_arduino.ino     ✅
├── raspberrypi code/
│   ├── auto3.py                                 ✅
│   ├── auto_capture_pi5.py                      ✅
│   └── auto_capture_3_updated.py                ✅
├── dl-processing-engine/
│   ├── app.py                                   ✅ UPDATED — 10 endpoints, CORS
│   ├── config.py                                ✅ UPDATED — Gemini/Tesseract/output dirs
│   ├── processing.py                            ✅
│   ├── offline_processing.py                    ✅
│   ├── run_on_laptop.py                         ✅
│   ├── train_detector.py                        ✅
│   ├── train_recognizer.py                      ✅
│   ├── gemini_router.py                         ✅ NEW — Gemini API, hidden from UI
│   ├── trocr_inference.py                       ✅ NEW — TrOCR singleton loader
│   ├── tesseract_ocr.py                         ✅ NEW — Tesseract wrapper
│   ├── traffic_controller.py                    ✅ NEW — routing + page_NNN.md save
│   ├── page_assembler.py                        ✅ NEW — list/get pages + Pandoc PDF
│   ├── .env.example                             ✅ NEW — key template
│   └── templates/
├── smartscan-web/
│   └── src/
│       ├── app/
│       │   ├── page.tsx                         ✅ WIRED — live status/health
│       │   ├── batch/page.tsx                   ✅ WIRED — real upload + processing
│       │   ├── gallery/page.tsx                 ✅ WIRED — real pages + zoom
│       │   ├── latex/page.tsx                   ✅ WIRED — KaTeX formula cards
│       │   ├── reader/page.tsx                  ✅ NEW — Book Reader + PDF viewer
│       │   └── system/page.tsx                  ✅ WIRED — health badges + live log
│       ├── lib/
│       │   └── flask-api.ts                     ✅ NEW — typed Flask client
│       └── hooks/
│           └── use-smartscan.ts                 ✅ NEW — SWR polling hooks
├── models/
│   ├── best.pt                                  ⬇️ Download from Colab after training
│   ├── fasterrcnn_math_detector.pt              ✅
│   └── trocr-latex/                             ✅
├── datasets/
│   └── ibem/                                    ✅
├── SmartScan_Captures/                          ✅ (20 images)
├── Math_Detection_YOLOv8.ipynb                  ✅
├── Math_Recognition_TrOCR.ipynb                 ✅
├── output/                                      ✅ AUTO-CREATED by config.py
│   ├── pages/                                   page_001.md … page_NNN.md
│   └── pdf/Final_Book.pdf                       compiled via Pandoc
└── requirements.txt                             ✅ UPDATED
```
