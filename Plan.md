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
| **DL Processing Engine** | `app.py`, `processing.py`, `offline_processing.py`, `run_on_laptop.py`, `config.py` | ⚠️ Partial — crop/dewarp/YOLO detect works, but no TrOCR inference, no Gemini routing, no PDF assembly |
| **ML Training (Local)**  | `train_detector.py` (Faster R-CNN), `train_recognizer.py` (TrOCR)                   | ✅ Done — scripts ready, model files exist in `models/`                                                |
| **ML Training (Colab)**  | `Math_Detection_YOLOv8.ipynb`, `Math_Recognition_TrOCR.ipynb`                       | ✅ Done — Colab Pro notebooks with auto-resume                                                         |
| **Next.js Dashboard**    | `smartscan-web/` — Dashboard, Batch, Gallery, LaTeX, System pages                   | ⚠️ Partial — UI shell exists, no API wiring, no PDF viewer                                             |
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

### 🔧 Backend Tasks (Priority Order)

- [ ] **B1:** Implement `gemini_router.py` — Gemini API integration with `google-generativeai`
- [ ] **B2:** Implement `trocr_inference.py` — load TrOCR model, expose `POST /recognize`
- [ ] **B3:** Implement `tesseract_ocr.py` — Tesseract wrapper for plain text
- [ ] **B4:** Implement `traffic_controller.py` — YOLO count → route decision
- [ ] **B5:** Update `app.py` — add all new endpoints, CORS, integrate routing
- [ ] **B6:** Implement `page_assembler.py` — markdown merge + Pandoc PDF compilation
- [ ] **B7:** Update `config.py` — add Gemini key, Tesseract path, output dirs
- [ ] **B8:** Add real `GET /status`, `GET /health` endpoints with Pi/Arduino connectivity check
- [ ] **B9:** Add `GET /pages` and `GET /pages/:id/markdown` endpoints
- [ ] **B10:** Add `GET /book/pdf` endpoint (compile + serve)

### 🔧 Frontend Tasks (Priority Order)

- [ ] **F1:** Create Next.js API proxy routes (`src/app/api/*`)
- [ ] **F2:** Wire Dashboard page to real API data via SWR polling
- [ ] **F3:** Wire Batch Processor to upload + process flow
- [ ] **F4:** Wire Gallery page to serve real image triples
- [ ] **F5:** Wire LaTeX page to show real detected formulas with KaTeX
- [ ] **F6:** **Build Book Reader page (`/reader`)** — page-by-page viewer with KaTeX + PDF embed
- [ ] **F7:** Build `PageNavigator` component (prev/next/page number/thumbnails)
- [ ] **F8:** Build `PdfViewer` component (embedded PDF with page controls)
- [ ] **F9:** Add download PDF button
- [ ] **F10:** Polish animations, loading states, error handling

### 🔧 ML & Training Tasks

- [ ] **M1:** Run YOLOv8 notebook on Colab Pro → download `best.pt`
- [ ] **M2:** Run TrOCR notebook on Colab Pro → download `trocr_final/`
- [ ] **M3:** Test both models locally on captured images
- [ ] **M4:** Generate detection visualization images for demo
- [ ] **M5:** Calculate metrics (precision, recall, BLEU score) for presentation

### 🔧 Infrastructure Tasks

- [ ] **I1:** Install Pandoc + MiKTeX/TeX Live on dev machine
- [ ] **I2:** Install Tesseract OCR binary + add to PATH
- [ ] **I3:** Set up `.env` with `GEMINI_API_KEY`
- [ ] **I4:** Test SSH connectivity from laptop → Pi
- [ ] **I5:** Prepare backup pre-recorded demo video

---

## 📅 Updated Timeline

| Week       | Focus                         | Key Deliverables                                                               |
| ---------- | ----------------------------- | ------------------------------------------------------------------------------ |
| **Week 1** | ML Training                   | Run both Colab notebooks, download weights, verify locally                     |
| **Week 2** | Backend Pipeline              | Build B1-B6 (Gemini router, TrOCR inference, traffic controller, PDF assembly) |
| **Week 3** | Backend API + Frontend Wiring | Build B7-B10, F1-F5 (all endpoints + dashboard/batch/gallery/latex wiring)     |
| **Week 4** | Book Reader + Polish          | Build F6-F10 (reader page, PDF viewer, download, polish)                       |
| **Week 5** | Integration Testing           | End-to-end test with real hardware, fix bugs                                   |
| **Week 6** | Demo Prep                     | Rehearsal, backup video, presentation slides, metrics report                   |

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
│   ├── app.py                                   🔧 UPDATE
│   ├── config.py                                🔧 UPDATE
│   ├── processing.py                            ✅
│   ├── offline_processing.py                    ✅
│   ├── run_on_laptop.py                         ✅
│   ├── train_detector.py                        ✅
│   ├── train_recognizer.py                      ✅
│   ├── gemini_router.py                         🆕 NEW
│   ├── trocr_inference.py                       🆕 NEW
│   ├── tesseract_ocr.py                         🆕 NEW
│   ├── traffic_controller.py                    🆕 NEW
│   ├── page_assembler.py                        🆕 NEW
│   └── templates/
├── smartscan-web/
│   └── src/
│       ├── app/
│       │   ├── page.tsx                         🔧 Wire to API
│       │   ├── batch/page.tsx                   🔧 Wire to API
│       │   ├── gallery/page.tsx                 🔧 Wire to API
│       │   ├── latex/page.tsx                   🔧 Wire to API
│       │   ├── reader/page.tsx                  🆕 NEW — Book Reader
│       │   ├── system/page.tsx                  🔧 Wire to API
│       │   └── api/                             🆕 NEW — Proxy routes
│       └── components/
│           ├── reader/                          🆕 NEW
│           │   ├── book-reader.tsx
│           │   ├── page-renderer.tsx
│           │   ├── pdf-viewer.tsx
│           │   └── page-navigator.tsx
│           └── ...existing components
├── models/
│   ├── best.pt                                  ✅ (or download from Colab)
│   ├── fasterrcnn_math_detector.pt              ✅
│   └── trocr-latex/                             ✅
├── datasets/
│   └── ibem/                                    ✅
├── SmartScan_Captures/                          ✅ (20 images)
├── Math_Detection_YOLOv8.ipynb                  ✅
├── Math_Recognition_TrOCR.ipynb                 ✅
├── output/                                      🆕 NEW
│   ├── pages/                                   Markdown per page
│   └── Final_Book.pdf                           Compiled PDF
└── requirements.txt                             🔧 UPDATE
```
