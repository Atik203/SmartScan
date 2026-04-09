"""
SmartScan — Centralized Configuration
All paths are relative to the project root: E:\\PROJECT\\SmartScan
Update the values below to match your setup.
"""
import os

# ============================================================
# PROJECT ROOT — Change this if SmartScan lives elsewhere
# ============================================================
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Resolves to: E:\PROJECT\SmartScan

# ============================================================
# MODEL PATHS
# ============================================================
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
YOLO_MODEL_PATH = os.path.join(MODELS_DIR, "best.pt")
TROCR_MODEL_DIR = os.path.join(MODELS_DIR, "trocr-latex")

# ============================================================
# DATA PATHS (Processing Engine)
# ============================================================
DATA_DIR = os.path.join(PROJECT_ROOT, "dl-processing-engine", "data")

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
# RASPBERRY PI CONFIG (update for your Pi)
# ============================================================
PI_IP = "192.168.1.100"          # ← Update to your Pi's IP
PI_USER = "pi"                   # ← Update to your Pi's username
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
BATCH_SIZE_DETECTION = 4       # Faster R-CNN on 6GB VRAM
BATCH_SIZE_RECOGNITION = 16    # TrOCR on 6GB VRAM
NUM_WORKERS = 4                # Ryzen 7 5800H has 8 cores
LEARNING_RATE = 1e-4
NUM_EPOCHS_DETECTION = 25
NUM_EPOCHS_RECOGNITION = 15

# ============================================================
# AUTO-CREATE DIRECTORIES
# ============================================================
def ensure_dirs():
    """Create all necessary directories."""
    dirs = [
        MODELS_DIR, DATA_DIR, LOCAL_FOLDER, CROPPED_FOLDER,
        DEWARPED_FOLDER, PREDICTED_FOLDER, EXTRACTED_FOLDER,
        LOGS_DIR, OFFLINE_DIR, PERM_CROP_FOLDER, PERM_DEWARP_FOLDER,
        PERM_PREDICT_FOLDER, PERM_EXTRACT_FOLDER, DATASETS_DIR,
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)


if __name__ == "__main__":
    ensure_dirs()
    print(f"[✓] Project root: {PROJECT_ROOT}")
    print(f"[✓] All directories created successfully.")
    print(f"[✓] YOLO model expected at: {YOLO_MODEL_PATH}")
    print(f"[✓] Data directory: {DATA_DIR}")
