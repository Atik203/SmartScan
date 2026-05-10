# ==============================================================================
# CELL 1 — Setup Environment & Mount Drive
# ==============================================================================
!pip install -q transformers datasets evaluate accelerate

from google.colab import drive
import os

drive.mount('/content/drive')

PROJECT_DIR    = '/content/drive/MyDrive/Smart_Scan/Recognition_Model'
CHECKPOINT_DIR = os.path.join(PROJECT_DIR, 'trocr_checkpoints')
FINAL_MODEL_DIR= os.path.join(PROJECT_DIR, 'trocr_final')

os.makedirs(CHECKPOINT_DIR, exist_ok=True)
os.makedirs(FINAL_MODEL_DIR, exist_ok=True)

print(f"[OK] Environment ready. Checkpoints -> {CHECKPOINT_DIR}")
