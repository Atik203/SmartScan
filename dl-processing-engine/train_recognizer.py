"""
SmartScan — Train Math Expression Recognition Model (TrOCR)
============================================================
Uses HuggingFace's load_dataset("yuntian-deng/im2latex-100k-raw")
to download Im2LaTeX data directly — no manual download needed!

Dataset splits: train (165,099) | val (18,216) | test (20,430)
10% subset   : train (16,509)  | val (1,821)  | test (2,043)

Optimized for: RTX 3060 6GB VRAM + 32GB RAM (Ryzen 7 5800H)
Expected time: ~2-3 hours on 10% subset

Usage:
    cd E:\\PROJECT\\SmartScan\\dl-processing-engine
    .venv\\Scripts\\python.exe train_recognizer.py
"""

import os
import sys
import torch
import warnings
warnings.filterwarnings("ignore")

# Add this dir to path for config import
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import (
    MODELS_DIR, DEVICE, BATCH_SIZE_RECOGNITION,
    NUM_EPOCHS_RECOGNITION, LEARNING_RATE, ensure_dirs,
)

# Set HuggingFace env to suppress symlink warning on Windows
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

ensure_dirs()

# ============================================================
# STEP 1: Load Dataset from HuggingFace (auto-downloads)
# ============================================================
print("=" * 60)
print("[STEP 1] Loading Im2LaTeX-100K from HuggingFace...")
print("         This will auto-download on first run (~2GB)")
print("=" * 60)

from datasets import load_dataset

dataset = load_dataset("yuntian-deng/im2latex-100k-raw")
print(f"[OK] Dataset loaded!")
print(f"     Train : {len(dataset['train']):,} samples")
print(f"     Val   : {len(dataset['val']):,} samples")
print(f"     Test  : {len(dataset['test']):,} samples")

# ============================================================
# STEP 2: Take 10% subset (for faster training)
# ============================================================
print("\n" + "=" * 60)
print("[STEP 2] Creating 10% stratified subset...")
print("=" * 60)

SUBSET_FRACTION = 0.10  # Increase to 1.0 for full training

train_size = int(len(dataset["train"]) * SUBSET_FRACTION)
val_size   = int(len(dataset["val"])   * SUBSET_FRACTION)
test_size  = int(len(dataset["test"])  * SUBSET_FRACTION)

train_dataset = dataset["train"].shuffle(seed=42).select(range(train_size))
val_dataset   = dataset["val"].shuffle(seed=42).select(range(val_size))
test_dataset  = dataset["test"].shuffle(seed=42).select(range(test_size))

print(f"[OK] 10% subset ready:")
print(f"     Train : {len(train_dataset):,} samples")
print(f"     Val   : {len(val_dataset):,} samples")
print(f"     Test  : {len(test_dataset):,} samples")

# ============================================================
# STEP 3: Load TrOCR Model + Processor
# ============================================================
print("\n" + "=" * 60)
print("[STEP 3] Loading TrOCR model from HuggingFace...")
print("         Model: microsoft/trocr-base-printed")
print("=" * 60)

from transformers import (
    TrOCRProcessor,
    VisionEncoderDecoderModel,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
)

MODEL_NAME = "microsoft/trocr-base-printed"
processor  = TrOCRProcessor.from_pretrained(MODEL_NAME)
model      = VisionEncoderDecoderModel.from_pretrained(MODEL_NAME)

# Configure decoder for LaTeX generation
model.config.decoder_start_token_id = processor.tokenizer.cls_token_id
model.config.pad_token_id           = processor.tokenizer.pad_token_id
model.config.vocab_size             = model.config.decoder.vocab_size
model.config.eos_token_id          = processor.tokenizer.sep_token_id
model.config.max_length            = 256
model.config.early_stopping        = True
model.config.no_repeat_ngram_size  = 3
model.config.length_penalty        = 2.0
model.config.num_beams             = 4

device = torch.device(DEVICE if torch.cuda.is_available() else "cpu")
print(f"[OK] Training device : {device}")
if torch.cuda.is_available():
    gpu  = torch.cuda.get_device_properties(0)
    vram = gpu.total_memory / 1e9
    print(f"[OK] GPU             : {gpu.name}")
    print(f"[OK] VRAM            : {vram:.1f} GB")

# ============================================================
# STEP 4: Preprocess Dataset
# ============================================================
print("\n" + "=" * 60)
print("[STEP 4] Preprocessing dataset (tokenize + pixel values)...")
print("=" * 60)

def preprocess(examples):
    """Convert image + LaTeX formula into TrOCR model inputs."""
    images = examples["image"]
    texts  = examples["formula"]

    pixel_values = processor(
        images=[img.convert("RGB") for img in images],
        return_tensors="pt",
    ).pixel_values

    labels = processor.tokenizer(
        texts,
        padding="max_length",
        max_length=256,
        truncation=True,
        return_tensors="pt",
    ).input_ids

    # Mask padding tokens from loss computation
    labels[labels == processor.tokenizer.pad_token_id] = -100
    return {"pixel_values": pixel_values, "labels": labels}


print("[->] Processing training split...")
train_dataset = train_dataset.map(
    preprocess, batched=True, batch_size=32,
    remove_columns=train_dataset.column_names,
    desc="Train",
)

print("[->] Processing validation split...")
val_dataset = val_dataset.map(
    preprocess, batched=True, batch_size=32,
    remove_columns=val_dataset.column_names,
    desc="Val",
)

train_dataset.set_format(type="torch", columns=["pixel_values", "labels"])
val_dataset.set_format(type="torch",   columns=["pixel_values", "labels"])
print("[OK] Preprocessing complete!")

# ============================================================
# STEP 5: Training
# ============================================================
print("\n" + "=" * 60)
print(f"[STEP 5] Training TrOCR...")
print(f"         Epochs     : {NUM_EPOCHS_RECOGNITION}")
print(f"         Batch size : {BATCH_SIZE_RECOGNITION} (fp16 + 2x grad accum)")
print(f"         LR         : {LEARNING_RATE}")
print("=" * 60)

OUTPUT_DIR = os.path.join(MODELS_DIR, "trocr-latex")
os.makedirs(OUTPUT_DIR, exist_ok=True)

training_args = Seq2SeqTrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=NUM_EPOCHS_RECOGNITION,
    per_device_train_batch_size=BATCH_SIZE_RECOGNITION,
    per_device_eval_batch_size=BATCH_SIZE_RECOGNITION,
    learning_rate=LEARNING_RATE,
    weight_decay=0.01,
    warmup_steps=300,
    logging_steps=50,
    eval_strategy="steps",
    eval_steps=300,
    save_strategy="steps",
    save_steps=300,
    save_total_limit=2,
    predict_with_generate=True,
    fp16=torch.cuda.is_available(),       # mixed precision on RTX 3060
    gradient_accumulation_steps=2,        # effective batch = batch_size * 2
    dataloader_num_workers=4,             # Ryzen 7 5800H has 8 cores
    report_to="tensorboard",
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",
    greater_is_better=False,
    logging_dir=os.path.join(OUTPUT_DIR, "logs"),
)

trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    tokenizer=processor.tokenizer,
)

train_result = trainer.train()

# ============================================================
# STEP 6: Save model
# ============================================================
print("\n" + "=" * 60)
print("[STEP 6] Saving model...")
print("=" * 60)
trainer.save_model(OUTPUT_DIR)
processor.save_pretrained(OUTPUT_DIR)
print(f"[OK] Model saved to: {OUTPUT_DIR}")
print(f"[OK] Loss: {train_result.training_loss:.4f} | Steps: {train_result.global_step}")

# ============================================================
# STEP 7: Quick inference test
# ============================================================
print("\n" + "=" * 60)
print("[STEP 7] Quick inference test on a test sample...")
print("=" * 60)

test_sample  = dataset["test"][0]
test_image   = test_sample["image"].convert("RGB")
ground_truth = test_sample["formula"]

pixel_values = processor(test_image, return_tensors="pt").pixel_values.to(device)
model = model.to(device)

with torch.no_grad():
    generated = model.generate(pixel_values, max_length=256)

predicted = processor.batch_decode(generated, skip_special_tokens=True)[0]

print(f"  Ground Truth : {ground_truth[:100]}")
print(f"  Predicted    : {predicted[:100]}")
print("\n[DONE] Training complete!")
print(f"       Model at  : {OUTPUT_DIR}")
print(f"       Next step : Run inference with load_model.py or integrate with app.py")
