# SmartScan: Automated Academic Book Scanner & Digital Translation Pipeline

## Full Project Architecture & Execution Plan

**Objective:** Build a resource-aware, hybrid edge-cloud document digitization system. The system utilizes custom hardware (V-cradle, servo-driven page turners), high-resolution mobile capturing, local edge AI for layout analysis, and a cloud LLM (gemini-2.5-flash-lite) for complex LaTeX compilation, culminating in a Full-Stack React dashboard for user interaction.

---

## Phase 1: Hardware Synchronization & Capture

_The goal is to establish a closed-loop IoT system ensuring zero misfires during the physical scanning process._

### 1.1 Microcontroller & Actuator Setup

- **Components:** V-cradle (50-degree), MG996R Servos for gripper/flipper, 6000 RPM DC Blower Fan (suction), standard PC Fan (flicking).
- **Logic:** Arduino manages the PWM signals for the servos and relay modules for the fans.
- **Closed-Loop Comms:** Replace basic `delay()` functions with PySerial communication. The Arduino sends a `PAGE_READY` signal to the Raspberry Pi to trigger cameras only when the page is completely flat and stable.

### 1.2 High-Resolution Capture via ADB

- **Devices:** Vivo X300 Pro (Dimensity 9500) and Redmi Note 13 Pro.
- **Optimization:**
  - Utilize `KEYCODE_ENTER` (66) instead of `KEYCODE_CAMERA` to prevent the Redmi from slipping into Panorama mode.
  - Implement `ls -t` sorting to guarantee the extraction of the freshest image frame.
  - Include a dynamic `time.sleep()` payload specifically tuned to allow the Dimensity 9500 ISP time to finalize saving the 50MP+ images before ADB pull.

---

## Phase 2: Edge Pre-Processing (Raspberry Pi / Local Environment)

_Raw images are massive and distorted due to the V-cradle. They must be cleaned before AI inference._

### 2.1 Dynamic Cropping

- Replace hardcoded static centimeter cropping with **OpenCV Contour Detection**. The algorithm dynamically identifies the page boundaries, ensuring no text is cut off even if the book shifts slightly during flipping.

### 2.2 Curvature Dewarping

- Apply the `page-dewarp` algorithm to flatten the 45-degree geometric distortion caused by the V-cradle near the book's spine, creating a perfectly flat image ready for OCR.

---

## Phase 3: Custom Machine Learning Training (Google Colab Pro)

_Demonstrating rigorous CV knowledge by training custom models within a $10 Colab Pro budget constraint._

### 3.1 Model A: Mathematical Expression Detection (YOLOv8)

- **Dataset:** IBEM Dataset (Full Dataset).
- **Goal:** Train the model to draw highly accurate bounding boxes around inline and block equations.
- **Compute Strategy:** Train a lightweight `yolov8n.pt` (Nano) model on Colab.
- **Deployment:** Export the final weights to ONNX/TFLite format so it can run efficiently directly on the Raspberry Pi without requiring a heavy GPU.

### 3.2 Model B: Mathematical Expression Recognition (TrOCR)

- **Dataset:** Im2LaTeX-100K.
- **Budget Constraint Strategy:** Because training the full 100K dataset takes days (exceeding the $10 Colab compute unit limit), train a highly optimized **20,000 image subset**.
- **Goal:** Prove the capability to build a Vision-Encoder-Decoder model that reads image crops and outputs LaTeX strings. (This model serves as your academic proof-of-work for the thesis defense, while the live system uses the gemini-2.5-flash-lite API for speed).

---

## Phase 4: The Intelligent Hybrid Routing Pipeline

_This is the core software innovation: dynamically routing data to save compute, bandwidth, and API costs._

### 4.1 Edge AI Layout Analysis

- The Raspberry Pi runs the quantized YOLOv8 model locally on the dewarped image to count the number of math equations present.

### 4.2 The "Traffic Controller" Logic

- **Path A (Standard Text):** If YOLO detects `0` math equations, the Pi routes the image to **Tesseract OCR** (running locally). This costs zero API credits and works completely offline.
- **Path B (Complex Math):** If YOLO detects `>0` math equations, the Pi routes the _entire uncut image_ to the **gemini-2.5-flash-lite API**.
  - _Why?_ Sending the full page allows Gemini's multimodal capabilities to preserve the reading order natively, seamlessly weaving the English paragraphs and the LaTeX (`$$`) together without complex Python stitching scripts.
  - _Fallback:_ If the API is unavailable or budget cap is reached, route to local TrOCR + Tesseract and flag the page for manual review in the dashboard.

---

## Phase 5: Document Assembly & Compilation

_Converting raw OCR data into a beautifully typeset digital textbook._

### 5.1 Markdown Aggregation

- As pages are processed, save them sequentially (e.g., `page_001.md`, `page_002.md`).
- A Python script merges these files, inserting `\newpage` commands between them.

### 5.2 Pandoc LaTeX Engine

- Execute **Pandoc** with the `xelatex` PDF engine. This reads the Markdown files, beautifully renders all the `$$` LaTeX equations, and outputs a clean, searchable `Final_Book.pdf`.

---

## Phase 6: Full-Stack Web Interface (React + Python)

_Elevating the project from a set of scripts to a deployable, user-friendly product._

### 6.1 Backend API (Flask / FastAPI)

- Host a lightweight local server.
- **Endpoints:**
  - `POST /start-scan`: Triggers the Arduino and ADB capture sequence.
  - `POST /process-page`: Runs the routing logic and sends pages to gemini-2.5-flash-lite when needed.
  - `GET /status`: Returns the current page number and pipeline status.
  - `GET /latest-image`: Serves the most recently cropped/dewarped image.
  - `GET /usage`: Returns API usage, remaining budget, and last call latency.
  - `GET /download-pdf`: Serves the compiled Pandoc PDF.

### 6.2 Frontend Dashboard (React)

- **Tech Stack:** React, Tailwind CSS, Axios.
- **Features:**
  - **Live Viewer:** A split-screen UI showing the live camera feed (or latest pulled image) next to the live-generated Markdown text.
  - **Manual Override:** If the API makes a small mistake on a complex LaTeX formula, the user can edit the Markdown directly in the browser before the final PDF is compiled.
  - **System Metrics:** Displays active devices, API latency, and Raspberry Pi CPU usage.
  - **Export Center:** A dedicated button to compile the book and download the final PDF directly to the user's local machine.

---

## Timeline & Milestones

| Week       | Phase focus            | Key Deliverables                                                                                 |
| :--------- | :--------------------- | :----------------------------------------------------------------------------------------------- |
| **Week 1** | Hardware & Comms       | Arduino & Pi serial sync; ADB capture scripts optimized for dual-phone setup.                    |
| **Week 2** | ML Training (Colab)    | Train YOLOv8 on IBEM; Train TrOCR on 20k Im2LaTeX subset; download `.pt` files.                  |
| **Week 3** | Edge-Cloud Pipeline    | Integrate YOLO local detection with gemini-2.5-flash-lite routing logic in Python.               |
| **Week 4** | Document Assembly      | Build the Markdown merger and Pandoc PDF compilation script.                                     |
| **Week 5** | Full-Stack UI          | Develop Flask API and build the React Dashboard for live monitoring.                             |
| **Week 6** | Testing & Defense Prep | End-to-end scanning of a 50-page chapter; performance metric logging; final presentation tuning. |
