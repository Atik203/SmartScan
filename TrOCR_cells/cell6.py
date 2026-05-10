# ==============================================================================
# CELL 6 — Verify Saved Files
# ==============================================================================
import os

final_files      = os.listdir(FINAL_MODEL_DIR) if os.path.exists(FINAL_MODEL_DIR) else []
checkpoint_files = os.listdir(CHECKPOINT_DIR)  if os.path.exists(CHECKPOINT_DIR)  else []

print(f'[Drive] Final model  : {FINAL_MODEL_DIR}')
print(f'        Files        : {final_files}')
print(f'[Drive] Checkpoints  : {CHECKPOINT_DIR}')
print(f'        Files (first5): {checkpoint_files[:5]}')

if final_files:
    print('[OK] Model saved successfully on Drive!')
else:
    print('[WARN] No files found in final model directory — run Cell 5 first.')
