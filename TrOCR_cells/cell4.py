# ==============================================================================
# CELL 4 — Training (auto-resume from checkpoint if interrupted)
# ==============================================================================
from transformers import Seq2SeqTrainer, Seq2SeqTrainingArguments
from transformers.trainer_utils import get_last_checkpoint

training_args = Seq2SeqTrainingArguments(
    output_dir              = CHECKPOINT_DIR,
    predict_with_generate   = True,
    eval_strategy           = 'steps',
    generation_max_length   = 64,
    per_device_train_batch_size = 64,   # A100 optimized
    per_device_eval_batch_size  = 64,
    dataloader_num_workers  = 4,        # FIX: was 16, system max is 12; 4 is safe
    fp16                    = True,     # GPU half-precision acceleration
    logging_steps           = 50,
    save_steps              = 500,
    eval_steps              = 500,
    save_total_limit        = 3,
    num_train_epochs        = 5,
    load_best_model_at_end  = True,
    metric_for_best_model   = 'eval_loss',
    greater_is_better       = False,
)

trainer = Seq2SeqTrainer(
    model             = model,
    processing_class  = processor,   # FIX: was 'tokenizer=', renamed in transformers>=4.46
    args              = training_args,
    train_dataset     = train_dataset,
    eval_dataset      = eval_dataset,
)

# Auto-resume if Colab was interrupted
last_checkpoint = get_last_checkpoint(CHECKPOINT_DIR)

try:
    if last_checkpoint:
        print(f'[RESUME] Resuming from {last_checkpoint}...')
        trainer.train(resume_from_checkpoint=last_checkpoint)
    else:
        print('[START] Starting fresh training...')
        trainer.train()
    print('[OK] Training complete!')
except KeyboardInterrupt:
    print('[PAUSED] Re-run this cell to resume from last checkpoint.')
except Exception as e:
    print(f'[ERROR] {e}')
    print('Re-run this cell to resume from last checkpoint.')
    raise
