# ==============================================================================
# CELL 3: Auto-Resume Training Loop (OPTIMIZED FOR A100)
# ==============================================================================
import os
from ultralytics import YOLO

LOCAL_YOLO = '/content/IBEM_yolo_v2'
DATA_YAML  = os.path.join(LOCAL_YOLO, 'data.yaml')

if not os.path.exists(DATA_YAML):
    raise SystemExit("❌ DATA_YAML not found. Run Cell 2 first!")

print(f"✅ DATA_YAML found: {DATA_YAML}")

# Use a new run name to avoid conflicts
RUN_NAME = 'math_detector'
LAST_CHECKPOINT = os.path.join(RUNS_DIR, RUN_NAME, 'weights', 'last.pt')

if os.path.exists(LAST_CHECKPOINT):
    print(f"\n🔄 Resuming from checkpoint: {LAST_CHECKPOINT}")
    model = YOLO(LAST_CHECKPOINT)
    results = model.train(resume=True)
    print("✅ Training resumed and completed!")
else:
    print("\n🚀 Starting fresh training...")
    
    # UPGRADE 1: Use Small model instead of Nano (much better accuracy)
    model = YOLO('yolov8s.pt')
    
    results = model.train(
        data=DATA_YAML,
        epochs=100,             # Increased epochs for better learning
        imgsz=640,
        
        # --- A100 UTILIZATION UPGRADES ---
        batch=-1,               # AutoBatch: Automatically finds max batch size to fill A100 VRAM
        cache=True,             # Caches images in system RAM (you have 84GB, this makes it SUPER fast)
        workers=16,             # Uses more CPU cores to load data faster
        # ---------------------------------
        
        project=RUNS_DIR,
        name=RUN_NAME,
        save=True,
        save_period=5,
        device=0,
        exist_ok=True
    )
    print("🎉 Training complete!")
