# ==============================================================================
# CELL 3: Auto-Resume Training Loop (Colab Pro Resilient)
# ==============================================================================
# If Colab disconnected overnight, run Cell 2 first (3-5 min), then re-run this.

import os
from ultralytics import YOLO

# ── Safety check: DATA_YAML must exist ────────────────────────────────────────
LOCAL_YOLO = '/content/IBEM_yolo'
DATA_YAML  = os.path.join(LOCAL_YOLO, 'data.yaml')

if not os.path.exists(DATA_YAML):
    print("❌ DATA_YAML not found at /content/IBEM_yolo/data.yaml")
    print("   This means Colab restarted and wiped /content/")
    print("   ▶️  Run Cell 2 first (3-5 min), then re-run this cell.")
    raise SystemExit("Run Cell 2 first.")

print(f"✅ DATA_YAML found: {DATA_YAML}")

# ── Checkpoint path (saved on Drive — survives disconnects) ────────────────────
LAST_CHECKPOINT = os.path.join(RUNS_DIR, 'math_detector', 'weights', 'last.pt')

# ── Training ───────────────────────────────────────────────────────────────────
if os.path.exists(LAST_CHECKPOINT):
    print(f"\n🔄 Resuming from checkpoint: {LAST_CHECKPOINT}")
    model = YOLO(LAST_CHECKPOINT)
    results = model.train(
        resume=True,
        data=DATA_YAML,
        epochs=50,
        imgsz=640,
        batch=16,
        project=RUNS_DIR,
        name='math_detector',
        save=True,
        save_period=5,
        device=0
    )
    print("✅ Training resumed and completed!")

else:
    print("\n🚀 No checkpoint found — starting fresh training...")
    model = YOLO('yolov8n.pt')
    results = model.train(
        data=DATA_YAML,
        epochs=50,
        imgsz=640,
        batch=16,              # Lower to 8 if CUDA OOM error
        project=RUNS_DIR,      # Saves weights to Google Drive ✅
        name='math_detector',
        save=True,
        save_period=5,         # Checkpoint to Drive every 5 epochs
        device=0
    )
    print("🎉 Training complete!")
