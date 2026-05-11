# ==============================================================================
# CELL 4 — Training (A100 Optimized — uses full 40GB VRAM)
# ==============================================================================
from transformers import Seq2SeqTrainer, Seq2SeqTrainingArguments
from transformers.trainer_utils import get_last_checkpoint
import torch


training_args = Seq2SeqTrainingArguments(
    output_dir                  = CHECKPOINT_DIR,    # saves to Drive

    # ── Generation ────────────────────────────────────────────────────────────
    predict_with_generate       = True,
    generation_max_length       = 64,

    # ── Batch size: pushed to 96 to maximize L4's 24GB VRAM ───────────────
    per_device_train_batch_size = 96,
    per_device_eval_batch_size  = 96,
    gradient_accumulation_steps = 1,      # effective batch = 96 per step

    # ── Precision: bf16 is FASTER than fp16 on A100 (native support) ─────────
    bf16                        = True,   # A100 native bfloat16
    fp16                        = False,  # disable fp16 when using bf16

    # ── Data loading (optimized to use more of the 54GB System RAM) ───────────
    dataloader_num_workers      = 8,
    dataloader_pin_memory       = True,   # faster CPU->GPU transfer

    # ── Optimizer: fused AdamW is ~20% faster on A100 ─────────────────────────
    optim                       = 'adamw_torch_fused',

    # ── Logging & Saving ─────────────────────────────────────────────────────
    logging_steps               = 50,
    save_steps                  = 200,    # save more often with bigger batches
    eval_steps                  = 200,
    save_total_limit            = 3,
    num_train_epochs            = 5,
    load_best_model_at_end      = True,
    metric_for_best_model       = 'eval_loss',
    greater_is_better           = False,

    # ── Speed ─────────────────────────────────────────────────────────────────
    eval_strategy               = 'steps',
)

trainer = Seq2SeqTrainer(
    model            = model,
    processing_class = processor,
    args             = training_args,
    train_dataset    = train_dataset,
    eval_dataset     = eval_dataset,
)

# Auto-resume from last checkpoint (picks up where interrupted)
last_checkpoint = get_last_checkpoint(CHECKPOINT_DIR)

try:
    if last_checkpoint:
        print(f'[RESUME] Resuming from {last_checkpoint}')
        print(f'         Batch size: 96, Grad Acc: 1 (maximizing L4 24GB VRAM)')
        try:
            trainer.train(resume_from_checkpoint=last_checkpoint)
        except ValueError as e:
            if "Can't find a valid checkpoint" in str(e):
                print(f"[WARNING] Invalid checkpoint at {last_checkpoint}. Falling back to fresh training...")
                trainer.train()
            else:
                raise
    else:
        print('[START] Starting fresh training with A100-optimized settings...')
        trainer.train()
    print('[OK] Training complete!')
except KeyboardInterrupt:
    print('[PAUSED] Re-run this cell to resume from last checkpoint.')
except Exception as e:
    print(f'[ERROR] {e}')
    raise
