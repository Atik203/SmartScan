"""
SmartScan — Dataset Download & Verification Script
===================================================
Run this BEFORE training to download and verify the Im2LaTeX dataset.

Usage:
    cd E:\\PROJECT\\SmartScan\\dl-processing-engine
    .venv\\Scripts\\python.exe download_dataset.py
"""

import os
import sys

def _load_env_file(env_path):
    """Lightweight .env loader (no extra dependency required)."""
    if not os.path.exists(env_path):
        return
    with open(env_path, "r", encoding="utf-8") as f:
        for raw_line in f:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


def _configure_hf_environment():
    """Route all HF/Torch caches to G drive and initialize optional HF token."""
    cache_root = os.environ.get("SMARTSCAN_CACHE_ROOT", "G:/SmartScan-Cache")
    hf_home = f"{cache_root}/hf"

    os.environ["HF_HOME"] = hf_home
    os.environ["HF_DATASETS_CACHE"] = f"{hf_home}/datasets"
    os.environ["TRANSFORMERS_CACHE"] = f"{hf_home}/transformers"
    os.environ["HUGGINGFACE_HUB_CACHE"] = f"{hf_home}/hub"
    os.environ["TORCH_HOME"] = f"{cache_root}/torch"
    os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    _load_env_file(env_path)

    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_HUB_TOKEN")
    if token:
        os.environ.setdefault("HUGGINGFACE_HUB_TOKEN", token)
        try:
            from huggingface_hub import login
            login(token=token, add_to_git_credential=False)
            print("[OK] HuggingFace token detected and session login initialized.")
        except Exception as exc:
            print(f"[WARN] Token found but HuggingFace login skipped: {exc}")
    else:
        print("[INFO] HF token not found in environment; continuing with public access.")

    return hf_home


HF_HOME_PATH = _configure_hf_environment()

print("=" * 60)
print("SmartScan Dataset Downloader")
print("=" * 60)
print(f"Cache root: {HF_HOME_PATH}")

# ── Step 1: Im2LaTeX via HuggingFace ─────────────────────────
print("\n[1/2] Downloading Im2LaTeX-100K from HuggingFace...")
print("      Dataset: yuntian-deng/im2latex-100k-raw")
print("      Size:    ~2 GB (cached after first run)")
print("      This may take 5-15 minutes on first run...\n")

from datasets import load_dataset

try:
    dataset = load_dataset("yuntian-deng/im2latex-100k-raw")

    print(f"\n[OK] Im2LaTeX dataset loaded!")
    print(f"     Train : {len(dataset['train']):,} samples")
    print(f"     Val   : {len(dataset['val']):,} samples")
    print(f"     Test  : {len(dataset['test']):,} samples")

    # Show a sample
    sample = dataset["train"][0]
    print(f"\n[SAMPLE] Keys available: {list(sample.keys())}")
    print(f"[SAMPLE] Formula: {str(sample['formula'])[:80]}...")
    print(f"[SAMPLE] Image type: {type(sample['image'])}")

    # Create 10% subsets and report sizes
    train_10 = len(dataset["train"]) // 10
    val_10 = len(dataset["val"]) // 10
    test_10 = len(dataset["test"]) // 10
    print(f"\n[INFO] 10% subset sizes (what we will train on):")
    print(f"       Train : {train_10:,} samples")
    print(f"       Val   : {val_10:,} samples")
    print(f"       Test  : {test_10:,} samples")

except Exception as e:
    print(f"[ERROR] Failed to load Im2LaTeX: {e}")
    sys.exit(1)

# ── Step 2: Check IBEM ──────────────────────────────────────
print("\n" + "=" * 60)
print("[2/2] Checking IBEM dataset (Math Expression Detection)...")
print("=" * 60)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import IBEM_DATASET_DIR

ibem_images = os.path.join(IBEM_DATASET_DIR, "images")
ibem_anns   = os.path.join(IBEM_DATASET_DIR, "annotations")

if os.path.exists(ibem_images):
    count = len([f for f in os.listdir(ibem_images) if f.lower().endswith(('.png','.jpg','.jpeg'))])
    print(f"[OK] IBEM images found: {count} images at {ibem_images}")
else:
    print(f"[MISSING] IBEM not yet downloaded.")
    print(f"\n  Manual download required:")
    print(f"  1. Go to: https://zenodo.org/records/4756857")
    print(f"  2. Download the ZIP file")
    print(f"  3. Extract to: {IBEM_DATASET_DIR}")
    print(f"  4. Ensure structure:")
    print(f"       {IBEM_DATASET_DIR}/")
    print(f"         images/       <- .png or .jpg files")
    print(f"         annotations/  <- .xml or .json files")
    print(f"\n  Re-run this script after extracting.")

# ── Step 3: Check CUDA ──────────────────────────────────────
print("\n" + "=" * 60)
print("[3/3] Verifying GPU setup...")
print("=" * 60)
import torch
print(f"[OK] PyTorch   : {torch.__version__}")
print(f"[OK] CUDA      : {torch.cuda.is_available()}")
if torch.cuda.is_available():
    gpu = torch.cuda.get_device_properties(0)
    vram_gb = gpu.total_memory / 1e9
    print(f"[OK] GPU       : {gpu.name}")
    print(f"[OK] VRAM      : {vram_gb:.1f} GB")
    recommended_bs = 4 if vram_gb < 7 else 8
    print(f"[OK] Batch size: {recommended_bs} (recommended for {vram_gb:.0f}GB VRAM)")

print("\n" + "=" * 60)
print("READY. You can now run:")
print("  python train_recognizer.py   <- TrOCR (Im2LaTeX, auto-downloaded)")
print("  python train_detector.py     <- Faster R-CNN (needs IBEM first)")
print("=" * 60)
