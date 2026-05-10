# 📚 SmartScan — Automated Book Digitizer & LaTeX Extractor

### Project Proposal | Microprocessors and Microcontrollers Laboratory

---

> **Course:** CSE 4326 – Microprocessors and Microcontrollers Laboratory  
> **Project Type:** Mechatronic Automation & Deep Learning Computer Vision  
> **Institution:** United International University (UIU), Dhaka  
> **Based On:** S. Thamaraiselvan et al., "An Automated Academic Book Scanner With Deep Learning Powered Math Expression Detection and Recognition," IEEE Access, Vol. 13, 2025 — DOI: [10.1109/ACCESS.2025.3638780](https://doi.org/10.1109/ACCESS.2025.3638780)  
> **Repository:** [github.com/your-username/SmartScan](https://github.com/) _(To be updated)_

---

## 📌 Table of Contents

- [📚 SmartScan — Automated Book Digitizer \& LaTeX Extractor](#-smartscan--automated-book-digitizer--latex-extractor)
  - [Project Proposal | Microprocessors and Microcontrollers Laboratory](#project-proposal--microprocessors-and-microcontrollers-laboratory)
  - [📌 Table of Contents](#-table-of-contents)
  - [🎯 Executive Summary](#-executive-summary)
  - [❗ Problem Statement](#-problem-statement)
  - [🎯 Project Objectives](#-project-objectives)
  - [🏗️ System Architecture Overview](#️-system-architecture-overview)
  - [🔩 Hardware Components \& Bill of Materials](#-hardware-components--bill-of-materials)
  - [💻 Software Stack](#-software-stack)
  - [🔬 Feature Deep-Dive (With Physical Demo Plan)](#-feature-deep-dive-with-physical-demo-plan)
    - [Feature 1: Autonomous Page Flipping Engine (Physical Demo)](#feature-1-autonomous-page-flipping-engine-physical-demo)
    - [Feature 2: Synchronized ADB Camera Triggering (Physical Demo)](#feature-2-synchronized-adb-camera-triggering-physical-demo)
    - [Feature 3: Image Dewarping \& Polishing Pipeline (Physical Demo)](#feature-3-image-dewarping--polishing-pipeline-physical-demo)
    - [Feature 4: Deep Learning Math-to-LaTeX Pipeline (DL Showpiece)](#feature-4-deep-learning-math-to-latex-pipeline-dl-showpiece)
      - [Stage 1: Math Expression Detection (YOLOv8)](#stage-1-math-expression-detection-yolov8)
      - [Stage 2: Math Expression Recognition (TrOCR → LaTeX)](#stage-2-math-expression-recognition-trocr--latex)
    - [Feature 5: Real-Time Web Dashboard (Software Demo)](#feature-5-real-time-web-dashboard-software-demo)
  - [📊 Dataset Strategy (10% Subset)](#-dataset-strategy-10-subset)
  - [🔄 End-to-End Data Flow](#-end-to-end-data-flow)
  - [🎪 Physical Demo Plan](#-physical-demo-plan)
    - [Live Demo Sequence (5-7 minutes)](#live-demo-sequence-5-7-minutes)
    - [Backup Demo (if hardware issues)](#backup-demo-if-hardware-issues)
  - [📏 Key Metrics \& Expected Performance](#-key-metrics--expected-performance)
  - [💰 Budget Analysis](#-budget-analysis)
  - [📅 Project Timeline](#-project-timeline)
  - [❓ Potential Faculty Questions \& Prepared Answers](#-potential-faculty-questions--prepared-answers)
    - [Q1: "Why not just use ChatGPT/Google Lens for math OCR?"](#q1-why-not-just-use-chatgptgoogle-lens-for-math-ocr)
    - [Q2: "Why Arduino Mega instead of ESP32?"](#q2-why-arduino-mega-instead-of-esp32)
    - [Q3: "What happens if the YOLOv8 misses a formula?"](#q3-what-happens-if-the-yolov8-misses-a-formula)
    - [Q4: "How does this differ from the original paper's work?"](#q4-how-does-this-differ-from-the-original-papers-work)
    - [Q5: "Can this handle handwritten math?"](#q5-can-this-handle-handwritten-math)
    - [Q6: "What if the page-turn mechanism jams?"](#q6-what-if-the-page-turn-mechanism-jams)
    - [Q7: "Why do you need TWO phones?"](#q7-why-do-you-need-two-phones)
    - [Q8: "How does the 10% data strategy affect real-world performance?"](#q8-how-does-the-10-data-strategy-affect-real-world-performance)
  - [📎 References](#-references)

---

## 🎯 Executive Summary

**SmartScan** is a cost-effective, open-source **mechatronic book scanner** designed to automate the digitization of academic textbooks. Built for the Microprocessors and Microcontrollers Lab, the system utilizes a **tri-layer architecture**:

|    Layer     | Hardware                                       | Role                                                                                                                         |
| :----------: | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **① Muscle** | Arduino Mega 2560                              | Controls robotic gripper/slider arms via PWM, manages vacuum suction relay, sends "CAPTURE" signal over USB Serial           |
| **② Bridge** | Raspberry Pi 5 (8GB)                           | Listens for "CAPTURE" from Arduino, triggers dual smartphone cameras via ADB, pulls/rotates images, transfers to laptop      |
| **③ Brain**  | Python/Flask on Laptop + Next.js Web Dashboard | Processes images (crop → dewarp → detect → recognize), runs **YOLOv8** for math detection and **TrOCR** for LaTeX generation |

**What makes SmartScan special:**

- 🤖 **Fully autonomous** page-turn-to-LaTeX pipeline with zero human intervention
- 🧠 **Deep Learning powered** — detects math expressions with 95%+ precision, converts them to valid LaTeX code with 86% BLEU score
- 💰 **Under 15,000 BDT** (~$130 USD) total build cost
- 🌐 **Modern web dashboard** built with Next.js for real-time monitoring and batch processing

---

## ❗ Problem Statement

Digitizing academic textbooks—specifically engineering and mathematics books—presents three major bottlenecks:

| Problem                                 | Impact                                                        | SmartScan's Solution                                                              |
| --------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Manual Scanning is Tedious**          | A single book takes 2-4 hours of human effort                 | Robotic arms (Gripper & Slider) fully automate page-turning at 300-400 pages/hour |
| **Book Binding Gets Damaged**           | Flatbed scanners require pressing books flat, cracking spines | 50-degree V-shaped wooden cradle scans books safely without flat-pressing         |
| **Commercially Scanners are Expensive** | Professional scanners cost $5,000-$50,000+                    | Uses standard Android smartphones + $130 of electronics                           |
| **Standard OCR Fails at Math**          | Tesseract/Google OCR flatten math semantics, losing structure | Employs YOLOv8 for detection + TrOCR for LaTeX generation                         |

---

## 🎯 Project Objectives

1. **Physical Objective:** Construct a cost-effective physical wooden V-cradle with 3D-printed PLA/PLA+ robotic components (gripper + flipper arms)
2. **Microcontroller Objective:** Automate a full mechanical cycle (grip → lift → hold → flip) using an Arduino Mega 2560 and 4× MG996R high-torque servos
3. **Communication Objective:** Synchronize dual 45-degree camera captures perfectly with the "holding" phase using Raspberry Pi 5 + ADB bridge
4. **Image Processing Objective:** Process curved book pages into flat, cropped, and polished digital images using page-dewarp and OpenCV
5. **Deep Learning Objective:** Extract standard text using Tesseract, route complex pages to **gemini-2.5-flash-lite**, and keep YOLOv8 + TrOCR as the proof-of-work and offline fallback _(Trained on 10% subsets of IBEM and Im2LaTeX-100K)_
6. **Web Dashboard Objective:** Build a modern Next.js web interface for real-time scan monitoring, batch processing, and LaTeX preview

---

## 🏗️ System Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    ① MECHATRONIC HARDWARE LAYER                     │
│  Arduino Mega 2560 · MG996R Servos (×4) · 12V Blower Fan           │
│  • Generates PWM signals to drive Gripper & Slider robotic arms    │
│  • Triggers 5V Relay for vacuum suction (page lifting)             │
│  • Sends "CAPTURE" command via USB Serial during hold phase        │
└──────────────────────┬──────────────────────────────────────────────┘
                       ▼ USB Serial (Baud: 9600)
┌─────────────────────────────────────────────────────────────────────┐
│                    ② COMMUNICATION BRIDGE LAYER                     │
│  Raspberry Pi 5 (8GB) · Python 3 · PySerial                        │
│  • Listens for Arduino "CAPTURE" command on /dev/ttyUSB0           │
│  • Executes   adb shell input keyevent KEYCODE_CAMERA              │
│  • Pulls .jpg images via ADB from Left & Right Smartphones         │
│  • Rotates images and transfers to laptop via SSH/SCP              │
└──────────────────────┬──────────────────────────────────────────────┘
                       ▼ Local Network / Direct File Transfer
┌─────────────────────────────────────────────────────────────────────┐
│                    ③ DEEP LEARNING PROCESSING LAYER                 │
│  Laptop/PC Backend · Python · OpenCV · YOLOv8 · TrOCR               │
│  • page-dewarp: Flattens curved page geometry                      │
│  • Tesseract OCR: Extracts standard paragraph text                 │
│  • YOLOv8 (Ultralytics): Detects math expression regions           │
│  • TrOCR (Vision Encoder-Decoder): Converts math → LaTeX code      │
│  • Next.js Web Dashboard: Real-time monitoring + batch processing  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔩 Hardware Components & Bill of Materials

| #   | Component                            | Qty | Purpose                                          | Est. Cost (BDT) |
| --- | ------------------------------------ | --- | ------------------------------------------------ | --------------: |
| 1   | Arduino Mega 2560                    | 1   | Central microcontroller for servo/relay/serial   |           1,200 |
| 2   | Raspberry Pi 5 (8GB)                 | 1   | ADB bridge + serial listener + image transfer    |           7,000 |
| 3   | MG996R Servo Motor                   | 4   | High-torque actuators for gripper & flipper arms |           1,200 |
| 4   | 6000 RPM DC Blower Fan               | 1   | High-speed suction for page lifting              |             300 |
| 5   | PC Fan (80mm)                        | 1   | Air flick for page separation                    |             150 |
| 6   | 5V DC Relay Module                   | 1   | Fan switching control from Arduino               |             100 |
| 7   | LM2596 Buck Converter                | 1   | Steps 12V → 5V for logic devices                 |             100 |
| 8   | 500W SMPS Power Supply               | 1   | Provides stable 12V/5V rails                     |             800 |
| 9   | V-Cradle Wooden Frame                | 1   | 50-degree book support structure                 |             500 |
| 10  | 3D Printed Parts (PLA+)              | Set | Gripper/flipper arms, joints                     |           1,500 |
| 11  | Wires, Potentiometers, Buttons, LEDs | Set | Control panel & wiring                           |             500 |
| 12  | Android Smartphones (×2)             | 2   | Existing student phones — no extra cost          |               0 |
|     |                                      |     | **TOTAL**                                        |     **~13,350** |

---

## 💻 Software Stack

| Layer            | Technology                          | Version     | Purpose                                |
| ---------------- | ----------------------------------- | ----------- | -------------------------------------- |
| **Embedded**     | Arduino IDE + C++                   | 2.x         | Servo PWM, serial comm, relay logic    |
| **Bridge**       | Python 3 + PySerial + ADB           | 3.11+       | Serial listener, camera trigger, SCP   |
| **Processing**   | OpenCV, page-dewarp                 | 4.8+        | Image crop, dewarp, deskew             |
| **Detection**    | YOLOv8 (Ultralytics)                | 8.x         | Math expression bounding box detection |
| **Recognition**  | TrOCR (Vision Encoder-Decoder)      | HuggingFace | Math image → LaTeX text                |
| **Cloud LLM**    | gemini-2.5-flash-lite               | API         | Mixed text + math LaTeX compilation    |
| **Text OCR**     | Tesseract OCR                       | 5.x         | Standard text extraction               |
| **Web Backend**  | Flask (legacy) / Next.js API Routes | 3.0 / 14+   | REST API, file uploads, processing     |
| **Web Frontend** | Next.js + shadcn/ui + TailwindCSS   | 14+         | Modern dashboard UI                    |

---

## 🔬 Feature Deep-Dive (With Physical Demo Plan)

### Feature 1: Autonomous Page Flipping Engine (Physical Demo)

**What it does:** The Arduino Mega orchestrates a precise 4-stage mechanical cycle that automatically turns book pages without human intervention.

**The Physical Cycle (10-12 seconds per page):**

```
Stage 1: GRIP          Stage 2: HOLD + CAPTURE     Stage 3: FLIP           Stage 4: RESET
┌──────────┐           ┌──────────┐                ┌──────────┐           ┌──────────┐
│ Gripper ↓│           │ Cameras 📸│                │ Suction ↑│           │ Return ↺ │
│ Isolates │    →      │ Pi fires │       →        │ Blower   │     →     │ All arms │
│ 1 page   │           │ ADB cmds │                │ lifts pg │           │ to start │
└──────────┘           └──────────┘                └──────────┘           └──────────┘
```

**Demo:** We will show the machine autonomously flipping 3-5 real book pages with the control panel buttons. Faculty can watch the servo-driven gripper isolate one page, hold it steady for cameras, and flip.

**Technical Highlights:**

- Potentiometer-controlled position saving (Position 1 and Position 2 calibration)
- Smooth servo interpolation with deceleration near end positions
- Debounced button inputs with LED feedback (save/play/pause/reset)
- Fan relay timed activation for page separation

---

### Feature 2: Synchronized ADB Camera Triggering (Physical Demo)

**What it does:** The Raspberry Pi 5 acts as an intelligent bridge, listening to the Arduino's serial port and simultaneously triggering both smartphones' cameras via ADB.

**The Communication Flow:**

```
Arduino Mega                  Raspberry Pi 5                  Smartphones
    │                              │                              │
    │── Serial "CAPTURE" ────────→ │                              │
    │                              │── adb -s LEFT shell ──────→ │ 📸 Left Camera
    │                              │── adb -s RIGHT shell ─────→ │ 📸 Right Camera
    │                              │                              │
    │                              │←── adb pull (Left .jpg) ──── │
    │                              │←── adb pull (Right .jpg) ─── │
    │                              │                              │
    │                              │── Rotate + Save ──→ page001-left.jpg
    │                              │                     page001-right.jpg
```

**Demo:** We will show the Pi receiving the "CAPTURE" trigger from Arduino and both phones taking simultaneous photos. The SSH terminal output will show the image pull logs.

**Technical Highlights:**

- ADB `keyevent KEYCODE_CAMERA` (keycode 27) for shutter-less capture
- Device serial number mapping for Left/Right identification
- Auto-rotation (90° CCW for left camera, 90° CW for right camera)
- Sequential page numbering with persistent counter file

---

### Feature 3: Image Dewarping & Polishing Pipeline (Physical Demo)

**What it does:** Transforms raw smartphone captures of a curved book page into flat, clean, print-quality images ready for AI processing.

**Processing Pipeline:**

```
Raw Capture  ──→  Cropped  ──→  Dewarped  ──→  Ready for AI
(curved + noisy)  (margins     (flat + clean)   (Tesseract +
                   removed)                      YOLOv8)
```

**Demo:** We will show a side-by-side comparison: the original curved photograph vs. the algorithmically flattened result. This will be visible in both the Flask interface and the Next.js dashboard.

**Technical Highlights:**

- Configurable margin cropping (cm-based with DPI conversion)
- `page-dewarp` library: cubic sheet model with gradient descent optimization
- OpenCV preprocessing: noise reduction, deskewing, contrast enhancement

---

### Feature 4: Deep Learning Math-to-LaTeX Pipeline (DL Showpiece)

> 🧠 **This is the project's crown jewel — the Deep Learning component.**

**What it does:** A two-stage deep learning pipeline that first _detects_ mathematical expressions in a page image, then _recognizes_ and converts each expression into syntactically correct LaTeX code. For mixed-layout pages, the system can route the full page to **gemini-2.5-flash-lite** to preserve reading order and LaTeX structure.

#### Stage 1: Math Expression Detection (YOLOv8)

| Metric    | Paper's Result  | Our Target (10% data) |
| --------- | --------------- | --------------------- |
| Precision | 95.71%          | ~88-92%               |
| Recall    | 91.77%          | ~85-90%               |
| F1-Score  | 93.74%          | ~86-91%               |
| Mean IoU  | 87.42%          | ~80-85%               |
| Inference | ~0.34 sec/image | ~0.5 sec/image        |

**Architecture:**

```
Input Image → YOLOv8 Backbone (C2f) → PAN/FPN Neck
           → Decoupled Head → Bounding Boxes + Confidence
           → Non-Maximum Suppression → Final Detections
```

**Training Plan:**

- Dataset: 10% of IBEM (~300 images with bounding box annotations)
- Base: `yolov8n.pt` (Ultralytics)
- Fine-tune with: mosaic/mixup, LR scheduling, data augmentation
- Expected training time: ~1-2 hours on laptop GPU

#### Stage 2: Math Expression Recognition (TrOCR → LaTeX)

| Metric     | Paper's Result | Our Target (10% data) |
| ---------- | -------------- | --------------------- |
| BLEU Score | 86.44%         | ~78-83%               |
| CER        | 10.84%         | ~14-18%               |

**Architecture:**

```
Cropped Math Image → Vision Transformer Encoder (DeiT/ViT)
                   → Patch Embedding → Positional Encoding
                   → Transformer Decoder (Auto-regressive)
                   → LaTeX Token Sequence
                   → Post-processing (remove padding/special tokens)
                   → Final LaTeX: \frac{x^2 + y}{z_n}
```

**Training Plan:**

- Dataset: 10% of Im2LaTeX-100K (~10,000 formula-LaTeX pairs)
- Base: `microsoft/trocr-base-printed` from HuggingFace
- Fine-tune on Im2LaTeX formula images → LaTeX text
- Expected training time: ~3-4 hours on laptop GPU

**Demo:** We will scan a real textbook page containing math, show the detection bounding boxes overlaid on the image, and display the generated LaTeX code rendered in real-time on the web dashboard.

---

### Feature 5: Real-Time Web Dashboard (Software Demo)

**What it does:** A modern, responsive web application built with Next.js + shadcn/ui + TailwindCSS that provides real-time monitoring, batch image processing, and LaTeX preview.

**Key Dashboard Pages:**

1. **Live Scanner Monitor** — Shows real-time scan status, page counter, connection health
2. **Batch Processor** — Upload multiple images, process through the full pipeline
3. **Detection Gallery** — View side-by-side: Original → Dewarped → Detected (with bounding boxes)
4. **LaTeX Preview** — See extracted math rendered as high-quality formulas using KaTeX
5. **System Dashboard** — Hardware stats, processing metrics, logs

**Demo:** We will demonstrate uploading a scanned page through the web interface and watching the pipeline process it from raw image to rendered LaTeX output.

---

## 📊 Dataset Strategy (10% Subset)

We will use 10% of each dataset to keep training practical while achieving competitive results:

| Dataset           | Full Size      | Our 10%      | Purpose                            |
| ----------------- | -------------- | ------------ | ---------------------------------- |
| **IBEM**          | ~3,000+ images | ~300 images  | Math expression detection (YOLOv8) |
| **Im2LaTeX-100K** | 100,000 pairs  | 10,000 pairs | Math → LaTeX recognition (TrOCR)   |

**Download Links:**

- IBEM: [https://doi.org/10.5281/zenodo.4757865](https://doi.org/10.5281/zenodo.4757865)
- Im2LaTeX-100K: [https://doi.org/10.5281/zenodo.56198](https://doi.org/10.5281/zenodo.56198)

> 📎 **Rationale:** The paper itself notes that recognition accuracy was limited by training data diversity. Using 10% lets us demonstrate the full pipeline within our compute budget (~6-7 hours total training on a consumer GPU) while still achieving meaningful metrics.

---

## 🔄 End-to-End Data Flow

```text
📖 Physical Book
    │
    ▼ [Arduino: Gripper isolates page]
    ▼ [Arduino: Sends "CAPTURE" via Serial]
    │
📱 Dual Smartphone Cameras
    │
    ▼ [Pi: ADB triggers KEYCODE_CAMERA]
    ▼ [Pi: ADB pulls .jpg to Pi storage]
    ▼ [Pi: Rotates images (L: CCW, R: CW)]
    │
💻 Laptop — Processing Engine
    │
    ├── Step 1: Crop (remove margins)
    ├── Step 2: Dewarp (flatten curvature via page-dewarp)
    ├── Step 3: Text Detection (Tesseract OCR for plain text)
    ├── Step 4: Math Detection (YOLOv8 bounding boxes)
    ├── Step 5: Routing Decision
    │     ├── If math detected: send full page to gemini-2.5-flash-lite
    │     └── Else: continue local OCR-only path
    ├── Step 6: Math Extraction (crop each detected region)
    ├── Step 7: Math Recognition (TrOCR → LaTeX strings)
    └── Step 8: Output Assembly
         │
         ├── 📄 Plain text file
         ├── 🔢 LaTeX formulas
         ├── 🖼️ Annotated images (with bounding boxes)
         └── 🌐 Web Dashboard (real-time preview)
```

---

## 🎪 Physical Demo Plan

We will demonstrate the following during the lab presentation:

### Live Demo Sequence (5-7 minutes)

| Step | What We Show                                                                          | Hardware/Software                      |
| ---- | ------------------------------------------------------------------------------------- | -------------------------------------- |
| 1    | **Calibration** — Save gripper & flipper positions using potentiometer + save buttons | Arduino + Control Panel                |
| 2    | **Autonomous Flip** — Press automation start, watch 3 pages flip automatically        | Full rig (Arduino + Servos + V-Cradle) |
| 3    | **Camera Capture** — Show Pi terminal receiving "CAPTURE" and phones taking photos    | Pi SSH terminal + 2 phones             |
| 4    | **Image Processing** — Show raw→cropped→dewarped transformation on screen             | Laptop terminal/web UI                 |
| 5    | **Math Detection** — Show YOLOv8 detecting equations with bounding boxes              | Web dashboard                          |
| 6    | **LaTeX Generation** — Show detected math converted to rendered LaTeX                 | Web dashboard with KaTeX               |

### Backup Demo (if hardware issues)

- Pre-recorded video of the scanner in operation
- Offline web interface processing pre-scanned images through the full AI pipeline
- Live YOLOv8 + TrOCR inference on pre-captured book images

---

## 📏 Key Metrics & Expected Performance

| Metric                  | Paper's Achievement | Our Expected (10% data) |
| ----------------------- | ------------------- | ----------------------- |
| **Detection Precision** | 95.71%              | ~88-92%                 |
| **Detection Recall**    | 91.77%              | ~85-90%                 |
| **Detection F1**        | 93.74%              | ~86-91%                 |
| **Detection mIoU**      | 87.42%              | ~80-85%                 |
| **Recognition BLEU**    | 86.44%              | ~78-83%                 |
| **Recognition CER**     | 10.84%              | ~14-18%                 |
| **Page Throughput**     | 300-400 pages/hr    | 200-300 pages/hr        |
| **Cycle Time**          | 10-12 sec/page      | 12-15 sec/page          |
| **Inference Latency**   | 0.34 sec/image      | ~0.5 sec/image          |
| **Total Build Cost**    | ~$215-240 USD       | ~$130 USD (15,000 BDT)  |

---

## 💰 Budget Analysis

| Item                        | Our Cost (BDT)  | Notes                               |
| --------------------------- | --------------- | ----------------------------------- |
| Arduino Mega 2560           | 1,200           | Local electronics market            |
| Raspberry Pi 5 (8GB)        | 7,000           | Available from authorized resellers |
| 4× MG996R Servos            | 1,200           | ~300 BDT each                       |
| Fans, Relay, Buck Converter | 550             | Standard components                 |
| SMPS Power Supply           | 800             | Recycled PC PSU option: 0 BDT       |
| Wood + 3D Printed Parts     | 2,000           | University 3D printer available     |
| Misc (wires, pots, buttons) | 500             |                                     |
| **Smartphones**             | **0**           | Use existing student phones         |
| **TOTAL**                   | **~13,250 BDT** | **~$115 USD**                       |

---

## 📅 Project Timeline

| Week | Milestone                              | Deliverables                               |
| ---- | -------------------------------------- | ------------------------------------------ |
| 1    | V-Cradle construction + Arduino wiring | Physical frame, servo mount, control panel |
| 2    | Arduino firmware + Pi serial bridge    | Working page-flip automation               |
| 3    | Camera integration + image pipeline    | End-to-end capture → dewarp working        |
| 4    | Dataset download + 10% sampling        | IBEM & Im2LaTeX subsets prepared           |
| 5    | YOLOv8 training + evaluation           | Detection model with metrics               |
| 6    | TrOCR fine-tuning + evaluation         | Recognition model with BLEU score          |
| 7    | Next.js web dashboard development      | Working web UI with all pages              |
| 8    | Integration testing + demo rehearsal   | Full pipeline demo-ready                   |

---

---

## 📎 References

1. S. Thamaraiselvan, V. Venugopal, S. Vekkot, and P. K. Pisharady, "An Automated Academic Book Scanner With Deep Learning Powered Math Expression Detection and Recognition," _IEEE Access_, vol. 13, pp. 206121–206137, 2025. DOI: [10.1109/ACCESS.2025.3638780](https://doi.org/10.1109/ACCESS.2025.3638780)
2. D. Anitei et al., "The IBEM dataset," _Pattern Recognit. Lett._, vol. 172, pp. 29–36, 2023. [Dataset: Zenodo](https://doi.org/10.5281/zenodo.4757865)
3. A. Kanervisto, "Im2latex-100k dataset," Zenodo, 2016. [Dataset](https://doi.org/10.5281/zenodo.56198)
4. M. Li et al., "TrOCR: Transformer-based optical character recognition," _Proc. AAAI_, 2023.
5. F. M. Schmitt-Koopmann et al., "MathNet: A data-centric approach for printed mathematical expression recognition," _IEEE Access_, 2024.
6. R. Smith, "An overview of the Tesseract OCR engine," _Proc. ICDAR_, 2007.

---

**Prepared by Md. Atikur Rahaman & Team | UIU CSE 4326 | April 2026**
