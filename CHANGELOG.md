# 📋 Changelog

All notable changes to SmartScan are documented in this file.

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Redis/Celery job queue for concurrent page processing
- Mobile-responsive frontend layout
- Multi-language OCR support (Arabic, Chinese)
- YOLOv8 model metrics dashboard (precision/recall curves)
- Docker Compose deployment configuration

---

## [1.0.0] — 2026-06-11

### Added — Hardware & Embedded
- Arduino Mega firmware with full automation state machine
  - 4× MG996R servo control (gripper + flipper pairs)
  - Potentiometer position calibration with persistent save (Pos1/Pos2)
  - Fan relay control with threshold-based activation
  - Serial `CAPTURE` signal at baud 9600
- Raspberry Pi 5 camera bridge scripts
  - `auto3.py` — Serial listener triggering ADB capture on CAPTURE event
  - `auto_capture_pi5.py` — Dual-phone ADB capture (Redmi Note 13 Pro + Vivo X300 Pro)
  - Duplicate detection, auto-rotation (L: CCW, R: CW)
  - 6-second ISP wait for 50MP+ camera processing

### Added — ML Pipeline
- YOLOv8 Colab training notebook (`Math_Detection_YOLOv8.ipynb`)
  - Fine-tuned on IBEM dataset with auto-resume support
  - Google Drive checkpoint saving
- TrOCR Colab training notebook (`Math_Recognition_TrOCR.ipynb`)
  - Fine-tuned `trocr-small-printed` on Im2LaTeX-100K subset
- Local training scripts
  - `train_detector.py` — Faster R-CNN ResNet50+FPN V2 on 10% IBEM
  - `train_recognizer.py` — TrOCR on 10% Im2LaTeX with on-the-fly preprocessing
- `download_dataset.py` — IBEM + Im2LaTeX automated downloader

### Added — Backend (Flask API)
- `app.py` — 10+ REST endpoints with full CORS support
  - `POST /process-page` — Full pipeline: crop → dewarp → YOLO detect → route
  - `POST /process-captures` — Batch process `SmartScan_Captures/`
  - `POST /recognize` — TrOCR inference endpoint
  - `GET /status` — Queue state + recent activity
  - `GET /health` — Arduino/Pi/model/Tesseract/Pandoc health checks
  - `GET /usage` — Gemini API usage tracking
  - `GET /pages` + `GET /pages/<n>` — Page listing and markdown retrieval
  - `GET /book/pdf` — Pandoc PDF compilation and streaming
  - `GET /gallery/<name>` — Multi-version image serving
  - Background watcher thread for `SmartScan_Captures/` folder
- `gemini_router.py` — Gemini 2.5 Flash Lite integration with usage tracking
- `trocr_inference.py` — Singleton TrOCR model loader with batch inference
- `tesseract_ocr.py` — Cross-platform Tesseract wrapper (Windows/Linux auto-detect)
- `traffic_controller.py` — Hybrid routing: Tesseract (text) / Gemini (math) / TrOCR (fallback)
- `page_assembler.py` — Page listing, markdown retrieval, Pandoc PDF compilation
- `config.py` — Centralized configuration (all paths, API keys, model paths)
- `.env.example` — Environment variable template

### Added — Frontend (Next.js 16)
- Dashboard page — Live SWR polling, real-time stats, activity feed, skeletons
- Batch Processor — Upload + sequential processing with progress tracking
- Gallery — Real page list, formula count, zoom modal viewer
- LaTeX Preview — KaTeX formula cards with copy/export `.tex`
- Book Reader (`/reader`) — Markdown+KaTeX renderer + PDF iframe mode
  - Page navigator (prev/next + thumbnails)
  - PDF iframe embed mode toggle
  - Download PDF + Recompile buttons
- System Monitor — Hardware health badges, API usage, live log
- `flask-api.ts` — Typed HTTP client for all Flask endpoints
- `use-smartscan.ts` — SWR polling hooks for all API endpoints
- Framer Motion animations, loading skeletons, error states across all pages

### Added — Documentation
- `README.md` — Full project documentation with architecture diagrams
- `CONTRIBUTING.md` — Contribution guidelines and coding standards
- `LICENSE.md` — MIT License with third-party notices
- `SECURITY.md` — Security policy and vulnerability reporting
- `CHANGELOG.md` — This file
- `Code_Setup_Guide.md` — Detailed path and dependency setup guide
- `Plan.md` — Full 7-phase project development plan
- `LAPTOP_SETUP.md` — Windows development environment setup
- `model_training_comparison.md` — YOLOv8 vs Faster R-CNN comparison

### Technical Details
- Image whiteness normalization via background division (replaces page-dewarp for flat pages)
- Minimal-margin crop (10px) to remove JPEG compression artifacts
- Dual-path AI routing with silent Gemini fallback (hidden from UI)
- KaTeX rendering for all math formulas in the frontend
- Pandoc + XeLaTeX PDF compilation pipeline
- Background watcher thread for automatic capture processing
- Persistent processed-file tracking to avoid duplicate processing

---

[Unreleased]: https://github.com/Atik203/SmartScan---Automated-Book-Digitizer---LaTeX-Extractor/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Atik203/SmartScan---Automated-Book-Digitizer---LaTeX-Extractor/releases/tag/v1.0.0
