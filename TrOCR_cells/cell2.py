# ==============================================================================
# CELL 2 — Load Dataset (Drive cache = instant re-runs, skips download)
# ==============================================================================
from datasets import load_dataset, load_from_disk
from transformers import TrOCRProcessor
import os

TRAIN_CACHE = os.path.join(PROJECT_DIR, 'cache_train_dataset')
EVAL_CACHE  = os.path.join(PROJECT_DIR, 'cache_eval_dataset')

processor = TrOCRProcessor.from_pretrained('microsoft/trocr-small-printed')

def preprocess_data(examples):
    pixel_values = processor(
        examples['image'], return_tensors='pt'
    ).pixel_values
    labels = processor.tokenizer(
        examples['formula'],
        padding='max_length',
        max_length=64,
        truncation=True        # FIX: truncate sequences > 64 tokens
    ).input_ids
    labels = [
        [tok if tok != processor.tokenizer.pad_token_id else -100 for tok in seq]
        for seq in labels
    ]
    return {'pixel_values': pixel_values.squeeze(), 'labels': labels}

# -------------------------------------------------------------------
# FAST PATH: load from Drive cache (all re-runs after first)
# -------------------------------------------------------------------
if os.path.exists(TRAIN_CACHE) and os.path.exists(EVAL_CACHE):
    print('[CACHE HIT] Loading processed datasets from Drive...')
    train_dataset = load_from_disk(TRAIN_CACHE)
    eval_dataset  = load_from_disk(EVAL_CACHE)
    print(f'[OK] Train: {len(train_dataset)}, Eval: {len(eval_dataset)} -- ready!')

# -------------------------------------------------------------------
# FIRST RUN: download + process + save to Drive cache
# -------------------------------------------------------------------
else:
    print('[FIRST RUN] Downloading Im2LaTeX dataset...')
    try:
        train_data = load_dataset('yuntian-deng/im2latex-100k', split='train[:100000]')
        eval_data  = load_dataset('yuntian-deng/im2latex-100k', split='val[:5000]')
        print(f'[OK] Downloaded: {len(train_data)} train, {len(eval_data)} eval')
    except Exception as e:
        print(f'[ERROR] {e}')
        raise

    # num_proc=1 required on Colab: PIL images cause forked workers to hang at 0%
    print('[INFO] Preprocessing... (this takes ~10-15 min for 55k samples, one-time only)')
    train_dataset = train_data.map(
        preprocess_data,
        remove_columns=['image', 'formula'],
        batched=True,
        batch_size=64,
        num_proc=1,
        desc='Train'
    )
    eval_dataset = eval_data.map(
        preprocess_data,
        remove_columns=['image', 'formula'],
        batched=True,
        batch_size=64,
        num_proc=1,
        desc='Eval'
    )

    print('[INFO] Saving to Drive cache for future re-runs...')
    train_dataset.save_to_disk(TRAIN_CACHE)
    eval_dataset.save_to_disk(EVAL_CACHE)
    print(f'[OK] Cached! Train: {len(train_dataset)}, Eval: {len(eval_dataset)}')
    print('     Next run will load instantly from cache.')
