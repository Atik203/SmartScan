"""
SmartScan — Centralized Configuration
All paths are relative to the project root: E:\\PROJECT\\SmartScan
Update the values below to match your setup.

To add your Gemini API key, create dl-processing-engine/.env with:
    GEMINI_API_KEY=your_key_here
"""

import os

# ============================================================
# PROJECT ROOT — Change this if SmartScan lives elsewhere
# ============================================================
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Resolves to: E:\PROJECT\SmartScan


# ============================================================
# ENV LOADING (local .env file)
# ============================================================
def _load_env_file() -> None:
    env_path = os.path.join(PROJECT_ROOT, "dl-processing-engine", ".env")
    if not os.path.exists(env_path):
        return
    try:
        from dotenv import load_dotenv  # type: ignore

        load_dotenv(env_path, override=False)
        return
    except Exception:
        pass

    # Fallback minimal parser (KEY=VALUE)
    try:
        with open(env_path, "r", encoding="utf-8") as fh:
            for raw in fh:
                line = raw.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                os.environ.setdefault(key, value)
    except Exception:
        return


_load_env_file()

# ============================================================
# MODEL PATHS
# ============================================================
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
# YOLOv8 best.pt is downloaded from Colab after training.
# Falls back to the Faster R-CNN model if best.pt is not yet available.
_yolo_candidate = os.path.join(MODELS_DIR, "best.pt")
FASTERRCNN_MODEL_PATH = os.path.join(MODELS_DIR, "fasterrcnn_math_detector.pt")
YOLO_MODEL_PATH = (
    _yolo_candidate if os.path.exists(_yolo_candidate) else FASTERRCNN_MODEL_PATH
)
_trocr_candidates = [
    os.path.join(MODELS_DIR, "trocr"),
    os.path.join(MODELS_DIR, "trocr-latex"),
]
TROCR_MODEL_DIR = next(
    (p for p in _trocr_candidates if os.path.isdir(p) and any(os.scandir(p))),
    _trocr_candidates[0],
)

# ============================================================
# DATA PATHS (Processing Engine)
# ============================================================
DATA_DIR = os.path.join(PROJECT_ROOT, "dl-processing-engine", "data")
CAPTURES_DIR = os.path.join(PROJECT_ROOT, "SmartScan_Captures")

# Online pipeline paths (images coming from Pi)
LOCAL_FOLDER = os.path.join(DATA_DIR, "from_pi")
CROPPED_FOLDER = os.path.join(DATA_DIR, "cropped")
DEWARPED_FOLDER = os.path.join(DATA_DIR, "dewarped")
PREDICTED_FOLDER = os.path.join(DATA_DIR, "predicted")
EXTRACTED_FOLDER = os.path.join(DATA_DIR, "extracted")
LOGS_DIR = os.path.join(DATA_DIR, "logs")

# Queue / state files
QUEUE_FILE = os.path.join(DATA_DIR, "image_queue.txt")
PROCESSED_FILE = os.path.join(DATA_DIR, "processed_images.txt")
CSV_LOG_FILE = os.path.join(LOGS_DIR, "image_log.csv")

# Offline / permanent storage (Flask web UI uploads)
OFFLINE_DIR = os.path.join(DATA_DIR, "offline")
PERM_CROP_FOLDER = os.path.join(OFFLINE_DIR, "cropped")
PERM_DEWARP_FOLDER = os.path.join(OFFLINE_DIR, "dewarped")
PERM_PREDICT_FOLDER = os.path.join(OFFLINE_DIR, "predicted")
PERM_EXTRACT_FOLDER = os.path.join(OFFLINE_DIR, "extracted")

# ============================================================
# OUTPUT DIRECTORIES (Markdown pages + compiled PDF)
# ============================================================
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "output")
MARKDOWN_OUTPUT_DIR = os.path.join(OUTPUT_DIR, "pages")
PDF_OUTPUT_DIR = os.path.join(OUTPUT_DIR, "pdf")
PDF_OUTPUT_PATH = os.path.join(PDF_OUTPUT_DIR, "Final_Book.pdf")

# ============================================================
# GEMINI API CONFIG
# Set GEMINI_API_KEY in your environment or in .env file
# ============================================================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")

# ============================================================
# TESSERACT OCR CONFIG
# ============================================================
# Set to full path of tesseract.exe on Windows, or empty string on Linux
TESSERACT_CMD = os.getenv(
    "TESSERACT_CMD",
    r"C:\Program Files\Tesseract-OCR\tesseract.exe" if os.name == "nt" else "",
)

# ============================================================
# RASPBERRY PI CONFIG (update for your Pi)
# ============================================================
PI_IP = "192.168.1.100"  # ← Update to your Pi's IP
PI_USER = "pi"  # ← Update to your Pi's username
PI_FOLDER = "/home/pi/smartscan/captured_images/"
PI_SERIAL_PORT = "/dev/ttyUSB0"  # ← Verify with: ls /dev/tty*
PI_BAUD_RATE = 9600

# ============================================================
# ADB PHONE CONFIG (update serial numbers from: adb devices)
# ============================================================
ADB_DEVICE_PATHS = {
    "YOUR_LEFT_PHONE_SERIAL": "/storage/emulated/0/DCIM/Camera",
    "YOUR_RIGHT_PHONE_SERIAL": "/storage/emulated/0/DCIM/Camera",
}
ADB_DEVICE_LABELS = {
    "YOUR_LEFT_PHONE_SERIAL": "left",
    "YOUR_RIGHT_PHONE_SERIAL": "right",
}

# ============================================================
# DATASET PATHS
# ============================================================
DATASETS_DIR = os.path.join(PROJECT_ROOT, "datasets")
IBEM_DATASET_DIR = os.path.join(DATASETS_DIR, "ibem")
IM2LATEX_DATASET_DIR = os.path.join(DATASETS_DIR, "im2latex")

# ============================================================
# TRAINING CONFIG (optimized for RTX 3060 6GB + 32GB RAM)
# ============================================================
DEVICE = "cuda"  # "cuda" for GPU, "cpu" for CPU
BATCH_SIZE_DETECTION = 4  # YOLOv8 on 6GB VRAM
BATCH_SIZE_RECOGNITION = 8  # TrOCR on 6GB VRAM (reduced for safety)
NUM_WORKERS = 4  # Ryzen 7 5800H has 8 cores
LEARNING_RATE = 1e-4
NUM_EPOCHS_DETECTION = 25
NUM_EPOCHS_RECOGNITION = 15


# ============================================================
# AUTO-CREATE DIRECTORIES
# ============================================================
def ensure_dirs():
    """Create all necessary directories."""
    dirs = [
        MODELS_DIR,
        DATA_DIR,
        CAPTURES_DIR,
        LOCAL_FOLDER,
        CROPPED_FOLDER,
        DEWARPED_FOLDER,
        PREDICTED_FOLDER,
        EXTRACTED_FOLDER,
        LOGS_DIR,
        OFFLINE_DIR,
        PERM_CROP_FOLDER,
        PERM_DEWARP_FOLDER,
        PERM_PREDICT_FOLDER,
        PERM_EXTRACT_FOLDER,
        DATASETS_DIR,
        OUTPUT_DIR,
        MARKDOWN_OUTPUT_DIR,
        PDF_OUTPUT_DIR,
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)


if __name__ == "__main__":
    ensure_dirs()
    print(f"[OK] Project root: {PROJECT_ROOT}")
    print(f"[OK] All directories created successfully.")
    print(f"[OK] YOLO model expected at: {YOLO_MODEL_PATH}")
    print(f"[OK] TrOCR model dir: {TROCR_MODEL_DIR}")
    print(f"[OK] Markdown output: {MARKDOWN_OUTPUT_DIR}")
    print(f"[OK] PDF output: {PDF_OUTPUT_PATH}")
    print(f"[OK] Gemini key set: {'YES' if GEMINI_API_KEY else 'NO — add to .env'}")
    print(f"[OK] Data directory: {DATA_DIR}")
