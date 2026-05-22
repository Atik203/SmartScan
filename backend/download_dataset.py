"""
SmartScan — Dataset Download & Verification Script
===================================================
Run this BEFORE training to download and verify the Im2LaTeX dataset.

Usage:
    cd E:\\PROJECT\\SmartScan\\dl-processing-engine
    .venv\\Scripts\\python.exe download_dataset.py
"""

import json
import os
import shutil
import sys
import tarfile
import tempfile
import urllib.request
import zipfile

IBEM_RECORD_APIS = [
    "https://zenodo.org/api/records/4757865",  # IBEM Mathematical Formula Detection Dataset
    "https://zenodo.org/api/records/4756857",  # legacy link seen in old docs (often not IBEM)
]
IBEM_ARCHIVE_EXTENSIONS = (".zip", ".tar.gz", ".tgz", ".tar")


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
        print(
            "[INFO] HF token not found in environment; continuing with public access."
        )

    return hf_home


HF_HOME_PATH = _configure_hf_environment()


def _download_file(url, output_path, chunk_size=1024 * 1024):
    """Download a file with simple progress output."""
    with urllib.request.urlopen(url) as response:
        total = response.headers.get("Content-Length")
        total_bytes = int(total) if total else None

        downloaded = 0
        with open(output_path, "wb") as f:
            while True:
                chunk = response.read(chunk_size)
                if not chunk:
                    break
                f.write(chunk)
                downloaded += len(chunk)
                if total_bytes:
                    pct = (downloaded / total_bytes) * 100
                    print(
                        f"      Downloaded: {downloaded / 1e6:.1f}MB / {total_bytes / 1e6:.1f}MB ({pct:.1f}%)",
                        end="\r",
                    )
                else:
                    print(f"      Downloaded: {downloaded / 1e6:.1f}MB", end="\r")
        print()


def _extract_archive(archive_path, extract_to):
    """Extract ZIP or TAR archive."""
    if zipfile.is_zipfile(archive_path):
        with zipfile.ZipFile(archive_path, "r") as zip_ref:
            zip_ref.extractall(extract_to)
        return

    if tarfile.is_tarfile(archive_path):
        with tarfile.open(archive_path, "r:*") as tar_ref:
            tar_ref.extractall(extract_to)
        return

    raise ValueError(f"Unsupported archive format: {archive_path}")


def _has_ibem_structure(path):
    """Return True when path has images/ and annotations/ folders."""
    return os.path.isdir(os.path.join(path, "images")) and os.path.isdir(
        os.path.join(path, "annotations")
    )


def _find_ibem_root(search_root):
    """Find directory containing images/ and annotations/."""
    if _has_ibem_structure(search_root):
        return search_root

    for root, dirs, _ in os.walk(search_root):
        lower_dir_map = {d.lower(): d for d in dirs}
        if "images" in lower_dir_map and "annotations" in lower_dir_map:
            return root

    return None


def _select_ibem_archive(record_json):
    """Pick best candidate archive file from Zenodo metadata."""
    files = record_json.get("files", [])
    if not files:
        raise RuntimeError("No files were found in the Zenodo record.")

    candidates = []
    for item in files:
        key = item.get("key", "")
        links = item.get("links", {})
        link = links.get("self") or links.get("download")
        if not link:
            continue

        size = item.get("size", 0)
        key_lower = key.lower()
        if key_lower.endswith(IBEM_ARCHIVE_EXTENSIONS):
            candidates.append((size, key, link))

    if not candidates:
        raise RuntimeError(
            "Record does not contain archive files (.zip/.tar/.tgz/.tar.gz)."
        )

    candidates.sort(key=lambda x: x[0], reverse=True)
    return candidates[0]


def _download_ibem_dataset(target_dir):
    """Download IBEM from Zenodo and normalize into target_dir/images + annotations."""
    os.makedirs(target_dir, exist_ok=True)

    if _has_ibem_structure(target_dir):
        print(f"[OK] IBEM already available at: {target_dir}")
        return True

    print("[AUTO] IBEM not found locally. Starting automatic download from Zenodo...")

    record_json = None
    selection_error = None
    for api_url in IBEM_RECORD_APIS:
        try:
            with urllib.request.urlopen(api_url) as response:
                candidate_record = json.loads(response.read().decode("utf-8"))
            size, filename, download_url = _select_ibem_archive(candidate_record)
            record_json = candidate_record
            break
        except Exception as exc:
            selection_error = exc
            continue

    if record_json is None:
        raise RuntimeError(
            f"Unable to find a valid IBEM archive in known records: {selection_error}"
        )

    record_id = record_json.get("id", "unknown")
    print(f"[AUTO] Resolved Zenodo record id: {record_id}")
    print(f"[AUTO] Selected file: {filename} ({size / 1e6:.1f} MB)")

    with tempfile.TemporaryDirectory(prefix="ibem_download_") as temp_dir:
        archive_path = os.path.join(temp_dir, filename)
        extract_dir = os.path.join(temp_dir, "extracted")
        os.makedirs(extract_dir, exist_ok=True)

        print(f"[AUTO] Downloading IBEM archive...")
        _download_file(download_url, archive_path)

        print("[AUTO] Extracting archive...")
        _extract_archive(archive_path, extract_dir)

        ibem_root = _find_ibem_root(extract_dir)
        if not ibem_root:
            raise RuntimeError(
                "Downloaded archive does not contain expected images/ and annotations/ folders."
            )

        src_images = os.path.join(ibem_root, "images")
        src_annotations = os.path.join(ibem_root, "annotations")
        dst_images = os.path.join(target_dir, "images")
        dst_annotations = os.path.join(target_dir, "annotations")

        if os.path.exists(dst_images):
            shutil.rmtree(dst_images)
        if os.path.exists(dst_annotations):
            shutil.rmtree(dst_annotations)

        shutil.copytree(src_images, dst_images)
        shutil.copytree(src_annotations, dst_annotations)

    print(f"[OK] IBEM downloaded and prepared at: {target_dir}")
    return True


def _count_files(folder_path, extensions):
    """Count files with given extensions inside a folder."""
    if not os.path.exists(folder_path):
        return 0
    lower_ext = tuple(ext.lower() for ext in extensions)
    return len([f for f in os.listdir(folder_path) if f.lower().endswith(lower_ext)])


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
ibem_anns = os.path.join(IBEM_DATASET_DIR, "annotations")

if os.path.exists(ibem_images):
    count = _count_files(ibem_images, (".png", ".jpg", ".jpeg"))
    ann_count = _count_files(ibem_anns, (".xml", ".json"))
    print(f"[OK] IBEM images found: {count} images at {ibem_images}")
    print(f"[OK] IBEM annotations found: {ann_count} files at {ibem_anns}")
else:
    try:
        _download_ibem_dataset(IBEM_DATASET_DIR)
        count = _count_files(ibem_images, (".png", ".jpg", ".jpeg"))
        ann_count = _count_files(ibem_anns, (".xml", ".json"))
        print(f"[OK] IBEM images found: {count} images at {ibem_images}")
        print(f"[OK] IBEM annotations found: {ann_count} files at {ibem_anns}")
    except Exception as exc:
        print(f"[MISSING] Automatic IBEM download failed: {exc}")
        print("\n  Manual download fallback:")
        print("  1. Go to: https://zenodo.org/records/4757865")
        print("  2. Download the archive file")
        print(f"  3. Extract to: {IBEM_DATASET_DIR}")
        print("  4. Ensure structure:")
        print(f"       {IBEM_DATASET_DIR}/")
        print("         images/       <- .png or .jpg files")
        print("         annotations/  <- .xml or .json files")

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
