# ==============================================================================
# CELL 5 — Save Final Model to Drive
# ==============================================================================
print('[INFO] Saving final model to Drive...')
trainer.save_model(FINAL_MODEL_DIR)
processor.save_pretrained(FINAL_MODEL_DIR)
print(f'[OK] Model saved -> {FINAL_MODEL_DIR}')
