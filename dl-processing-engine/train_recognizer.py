"""
SmartScan — Train Math Expression Recognition Model (TrOCR)
============================================================
Uses HuggingFace's load_dataset("yuntian-deng/im2latex-100k-raw")
to download Im2LaTeX data directly — no manual download needed!

Optimized for: RTX 3060 6GB VRAM + 32GB RAM
Expected training time: ~2-3 hours on 10% data

Usage:
    cd E:\\PROJECT\\SmartScan\\dl-processing-engine
    python train_recognizer.py
"""

import os
import sys
import torch
import numpy as np
from PIL import Image
from tqdm import tqdm

# Add parent directory to path for config import
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import MODELS_DIR, DEVICE, BATCH_SIZE_RECOGNITION, NUM_EPOCHS_RECOGNITION, LEARNING_RATE, ensure_dirs

ensure_dirs()

# ============================================================
# STEP 1: Load Dataset from HuggingFace (auto-downloads)
# ============================================================
print("=" * 60)
print("📥 STEP 1: Loading Im2LaTeX-100K from HuggingFace...")
print("   This will auto-download on first run (~2GB)")
print("=" * 60)

from datasets import load_dataset

dataset = load_dataset("yuntian-deng/im2latex-100k-raw")
print(f"[✓] Dataset loaded!")
print(f"    Train: {len(dataset['train'])} samples")
print(f"    Valid: {len(dataset['validation'])} samples")
print(f"    Test:  {len(dataset['test'])} samples")

# ============================================================
# STEP 2: Take 10% subset (for faster training)
# ============================================================
print("\n" + "=" * 60)
print("✂️  STEP 2: Creating 10% subset...")
print("=" * 60)

SUBSET_FRACTION = 0.10  # Change to 1.0 for full dataset

train_size = int(len(dataset["train"]) * SUBSET_FRACTION)
val_size = int(len(dataset["validation"]) * SUBSET_FRACTION)
test_size = int(len(dataset["test"]) * SUBSET_FRACTION)

train_dataset = dataset["train"].shuffle(seed=42).select(range(train_size))
val_dataset = dataset["validation"].shuffle(seed=42).select(range(val_size))
test_dataset = dataset["test"].shuffle(seed=42).select(range(test_size))

print(f"[✓] 10% Subset:")
print(f"    Train: {len(train_dataset)} samples")
print(f"    Valid: {len(val_dataset)} samples")
print(f"    Test:  {len(test_dataset)} samples")

# ============================================================
# STEP 3: Load TrOCR Model + Processor
# ============================================================
print("\n" + "=" * 60)
print("🧠 STEP 3: Loading TrOCR model from HuggingFace...")
print("=" * 60)

from transformers import (
    TrOCRProcessor,
    VisionEncoderDecoderModel,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    default_data_collator,
)

# Use the base printed TrOCR model as starting point
MODEL_NAME = "microsoft/trocr-base-printed"

processor = TrOCRProcessor.from_pretrained(MODEL_NAME)
model = VisionEncoderDecoderModel.from_pretrained(MODEL_NAME)

# Configure the model for LaTeX generation
model.config.decoder_start_token_id = processor.tokenizer.cls_token_id
model.config.pad_token_id = processor.tokenizer.pad_token_id
model.config.vocab_size = model.config.decoder.vocab_size
model.config.eos_token_id = processor.tokenizer.sep_token_id
model.config.max_length = 256  # Max LaTeX sequence length
model.config.early_stopping = True
model.config.no_repeat_ngram_size = 3
model.config.length_penalty = 2.0
model.config.num_beams = 4

device = torch.device(DEVICE if torch.cuda.is_available() else "cpu")
print(f"[✓] Model loaded on: {device}")
if torch.cuda.is_available():
    print(f"    GPU: {torch.cuda.get_device_name(0)}")
    print(f"    VRAM: {torch.cuda.get_device_properties(0).total_mem / 1e9:.1f} GB")

# ============================================================
# STEP 4: Preprocess Dataset
# ============================================================
print("\n" + "=" * 60)
print("🔧 STEP 4: Preprocessing dataset...")
print("=" * 60)

def preprocess(examples):
    """Convert images + LaTeX text into model inputs."""
    images = examples["image"]
    texts = examples["formula"]

    # Process images
    pixel_values = processor(
        images=[img.convert("RGB") for img in images],
        return_tensors="pt"
    ).pixel_values

    # Tokenize LaTeX formulas
    labels = processor.tokenizer(
        texts,
        padding="max_length",
        max_length=256,
        truncation=True,
        return_tensors="pt",
    ).input_ids

    # Replace padding token id with -100 (ignored in loss)
    labels[labels == processor.tokenizer.pad_token_id] = -100

    return {"pixel_values": pixel_values, "labels": labels}


# Process datasets with batched transforms
print("[→] Processing training data...")
train_dataset = train_dataset.map(
    preprocess,
    batched=True,
    batch_size=32,
    remove_columns=train_dataset.column_names,
    desc="Processing train",
)

print("[→] Processing validation data...")
val_dataset = val_dataset.map(
    preprocess,
    batched=True,
    batch_size=32,
    remove_columns=val_dataset.column_names,
    desc="Processing validation",
)

# Set format for PyTorch
train_dataset.set_format(type="torch", columns=["pixel_values", "labels"])
val_dataset.set_format(type="torch", columns=["pixel_values", "labels"])

print(f"[✓] Preprocessing complete!")

# ============================================================
# STEP 5: Training Configuration
# ============================================================
print("\n" + "=" * 60)
print("🏋️ STEP 5: Starting training...")
print(f"   Epochs: {NUM_EPOCHS_RECOGNITION}")
print(f"   Batch size: {BATCH_SIZE_RECOGNITION}")
print(f"   Learning rate: {LEARNING_RATE}")
print("=" * 60)

OUTPUT_DIR = os.path.join(MODELS_DIR, "trocr-latex")

training_args = Seq2SeqTrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=NUM_EPOCHS_RECOGNITION,
    per_device_train_batch_size=BATCH_SIZE_RECOGNITION,
    per_device_eval_batch_size=BATCH_SIZE_RECOGNITION,
    learning_rate=LEARNING_RATE,
    weight_decay=0.01,
    warmup_steps=500,
    logging_steps=100,
    eval_strategy="steps",
    eval_steps=500,
    save_strategy="steps",
    save_steps=500,
    save_total_limit=3,
    predict_with_generate=True,
    fp16=torch.cuda.is_available(),  # Mixed precision for RTX 3060
    gradient_accumulation_steps=2,   # Effectively doubles batch size
    dataloader_num_workers=4,        # 8-core Ryzen 7 5800H
    report_to="tensorboard",
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",
    greater_is_better=False,
)

trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    tokenizer=processor.tokenizer,
)

# Train!
train_result = trainer.train()

# ============================================================
# STEP 6: Save the trained model
# ============================================================
print("\n" + "=" * 60)
print("💾 STEP 6: Saving model...")
print("=" * 60)

trainer.save_model(OUTPUT_DIR)
processor.save_pretrained(OUTPUT_DIR)

print(f"[✓] Model saved to: {OUTPUT_DIR}")
print(f"[✓] Training complete!")
print(f"\n📊 Training Results:")
print(f"   Loss: {train_result.training_loss:.4f}")
print(f"   Total steps: {train_result.global_step}")

# ============================================================
# STEP 7: Quick test
# ============================================================
print("\n" + "=" * 60)
print("🧪 STEP 7: Quick inference test...")
print("=" * 60)

# Load a test sample
test_sample = dataset["test"][0]
test_image = test_sample["image"].convert("RGB")
ground_truth = test_sample["formula"]

# Run inference
pixel_values = processor(test_image, return_tensors="pt").pixel_values.to(device)
model = model.to(device)

with torch.no_grad():
    generated = model.generate(pixel_values, max_length=256)

predicted = processor.batch_decode(generated, skip_special_tokens=True)[0]

print(f"  Ground Truth: {ground_truth[:80]}...")
print(f"  Predicted:    {predicted[:80]}...")
print(f"\n🎉 Training pipeline complete! Model ready at: {OUTPUT_DIR}")
