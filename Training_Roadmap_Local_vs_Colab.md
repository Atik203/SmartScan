# SmartScan Training Roadmap (Local Laptop vs Colab Pro)

## 1) Repository Content Overview

### Root-level folders and role

- `arduino-controller/`: Arduino Mega automation code for page flipping and capture signaling.
- `raspberry-pi-bridge/`: Raspberry Pi scripts for serial listening and ADB dual-camera capture.
- `dl-processing-engine/`: Main Python pipeline (crop, dewarp, detect, train, offline processing).
- `smartscan-web/`: Next.js dashboard and UI stack.
- `datasets/`: Intended storage for IBEM and other local training data.
- `models/`: Saved trained weights and TrOCR output folder.

### Current storage observations (from this machine)

- `dl-processing-engine/` is the largest folder because of `.venv` (~5.38 GB).
- `smartscan-web/` is ~0.85 GB (mostly dependency/build files).
- `datasets/` is currently empty.
- Existing offline extracted samples are small (about 180 files).

### Machine snapshot used for estimate

- CPU: AMD Ryzen 7 5800H (8 cores / 16 threads)
- RAM: 32 GB
- GPU: NVIDIA GeForce RTX 3060 Laptop GPU (6 GB VRAM)
- Disk free:
  - C: ~48.71 GB free
  - E: ~68.72 GB free
  - G: ~202.53 GB free

## 2) 10% Training Time Estimate on Your Laptop

Your scripts currently target:

- Detector: Faster R-CNN for 25 epochs on 10% IBEM.
- Recognizer: TrOCR for 15 epochs on 10% Im2LaTeX.

### Practical estimate (RTX 3060 6GB)

- Faster R-CNN detector (10% IBEM): about 1 to 3 hours.
- TrOCR recognizer (10% Im2LaTeX): about 6 to 12 hours.
- End-to-end 10% training (both): about 7 to 15 hours total.

### Why this range exists

- Image resolution differences and decoding overhead.
- Thermal throttling on laptop GPU.
- Evaluation/generation overhead every few hundred steps.
- Windows data loading overhead (especially with heavy image pipelines).

## 3) Full Dataset Training: Laptop vs Colab Pro

### Full training on local laptop (expected)

- Detector full IBEM: about 8 to 20 hours (depends on final IBEM size and augmentations).
- TrOCR full Im2LaTeX: about 2 to 5 days.
- Risk: long uninterrupted runs, thermal/power constraints, possible run interruptions.

### Full training on Colab Pro (expected)

- Typical GPU availability: T4 / L4 / A100 (varies by session).
- Full TrOCR training usually much faster than laptop; practical wall time often around 12 to 36 hours total training compute depending on GPU and hyperparameters.
- Main risk: session disconnects and runtime caps; must save checkpoints frequently.

### Recommendation

- Best strategy:
  1. Do 10% pilot locally first (verify data format, metrics, loss trends).
  2. Move full training to Colab Pro for speed and stability of completion.
- This gives low-cost debugging locally and high-throughput training in cloud.

## 4) Hugging Face Cache on G Drive (No C/E usage)

Your scripts are now set to route cache to G drive by default:

- `HF_HOME = G:/SmartScan-Cache/hf`
- `HF_DATASETS_CACHE = G:/SmartScan-Cache/hf/datasets`
- `TRANSFORMERS_CACHE = G:/SmartScan-Cache/hf/transformers`
- `HUGGINGFACE_HUB_CACHE = G:/SmartScan-Cache/hf/hub`
- `TORCH_HOME = G:/SmartScan-Cache/torch`

For persistent Windows user-level setup (recommended), run once in PowerShell:

```powershell
setx SMARTSCAN_CACHE_ROOT "G:\SmartScan-Cache"
setx HF_HOME "G:\SmartScan-Cache\hf"
setx HF_DATASETS_CACHE "G:\SmartScan-Cache\hf\datasets"
setx TRANSFORMERS_CACHE "G:\SmartScan-Cache\hf\transformers"
setx HUGGINGFACE_HUB_CACHE "G:\SmartScan-Cache\hf\hub"
setx TORCH_HOME "G:\SmartScan-Cache\torch"
```

Then open a new terminal before running training.

## 5) HF Token Handling

- Your `.env` token is now automatically read by the training/downloader scripts (without printing token values).
- Supported variable names:
  - `HF_TOKEN`
  - `HUGGINGFACE_HUB_TOKEN`
- If the token is present, scripts initialize Hugging Face login for that session.

Security note:

- Keep `.env` untracked in git (already ignored).
- If token was ever exposed in logs/screenshots/public chat, rotate it in Hugging Face settings.

## 6) Practical Execution Plan

1. Run dataset check and download:
   - `python dl-processing-engine/download_dataset.py`
2. Prepare IBEM manually under:
   - `datasets/ibem/images`
   - `datasets/ibem/annotations`
3. Run 10% pilot:
   - `python dl-processing-engine/train_detector.py`
   - `python dl-processing-engine/train_recognizer.py`
4. Record pilot metrics (loss, sample predictions, BLEU/CER if added).
5. Start Colab Pro full training with checkpoint save every fixed interval to Drive.

## 7) Suggested Colab Pro Setup for Full Training

- Use mixed precision (`fp16=True`) and gradient accumulation.
- Save checkpoints every 300 to 1000 steps to Google Drive.
- Keep a resume-ready script (`resume_from_checkpoint=True`).
- Start with same hyperparameters from local pilot, then tune batch size to available GPU.

---

Prepared for SmartScan planning on April 10, 2026.
