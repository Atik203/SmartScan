import os, shutil, yaml, glob, tarfile
from pathlib import Path
from PIL import Image

# ==============================================================================
# CELL 2: Convert IBEM Dataset → YOLO Format (FAST VERSION)
# Copies to /content/ local SSD first — 10x faster than working on Drive
# ==============================================================================

EXTRACT_PATH = os.path.join(DATASET_DIR, 'IBEM_data')   # on Drive
LOCAL_EXTRACT = '/content/IBEM_data'                      # local SSD (fast!)
LOCAL_YOLO    = '/content/IBEM_yolo'                      # local output
DRIVE_YOLO    = os.path.join(DATASET_DIR, 'IBEM_yolo')   # final Drive save

# ── Step 1: Copy from Drive → local /content/ ─────────────────────────────────
if not os.path.exists(LOCAL_EXTRACT) or len(os.listdir(LOCAL_EXTRACT)) == 0:
    print("⚡ Copying IBEM_data from Drive → /content/ (local SSD)...")
    shutil.copytree(EXTRACT_PATH, LOCAL_EXTRACT)
    print("✅ Done copying to local.")
else:
    print("✅ Already in /content/IBEM_data — skipping copy.")

# ── Step 2: Show annotation sample ────────────────────────────────────────────
sample_txts = [t for t in glob.glob(os.path.join(LOCAL_EXTRACT, '**', '*.txt'), recursive=True)
               if 'mapping' not in os.path.basename(t)]
if sample_txts:
    with open(sample_txts[0], 'r') as f:
        lines = f.readlines()
    print(f"\n📄 Sample annotation ({os.path.basename(sample_txts[0])}):")
    for l in lines[:5]:
        print(f"   {l.strip()}")

# ── Step 3: Group Tr*/Va*/Ts* folders ─────────────────────────────────────────
split_map = {}
for folder in os.listdir(LOCAL_EXTRACT):
    fpath = os.path.join(LOCAL_EXTRACT, folder)
    if not os.path.isdir(fpath):
        continue
    if folder.startswith('Tr'):
        split_map.setdefault('train', []).append(fpath)
    elif folder.startswith('Va'):
        split_map.setdefault('val', []).append(fpath)
    elif folder.startswith('Ts'):
        split_map.setdefault('test', []).append(fpath)

for split, folders in split_map.items():
    print(f"   {split}: {[os.path.basename(f) for f in folders]}")

# ── Step 4: Create YOLO dirs ───────────────────────────────────────────────────
for split in ['train', 'val', 'test']:
    os.makedirs(os.path.join(LOCAL_YOLO, 'images', split), exist_ok=True)
    os.makedirs(os.path.join(LOCAL_YOLO, 'labels', split), exist_ok=True)

def ibem_to_yolo(txt_path, W, H):
    """Convert IBEM bbox annotations to YOLO normalized format."""
    yolo_lines = []
    with open(txt_path, 'r') as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) < 4:
                continue
            try:
                vals = list(map(float, parts[:4]))
                x_min, y_min, x_max, y_max = vals
                # If x_max <= x_min, it might be x y w h format
                if x_max <= x_min or y_max <= y_min:
                    x_max = x_min + x_max
                    y_max = y_min + y_max
                # Clamp
                x_min = max(0.0, min(x_min, W))
                x_max = max(0.0, min(x_max, W))
                y_min = max(0.0, min(y_min, H))
                y_max = max(0.0, min(y_max, H))
                x_c = ((x_min + x_max) / 2) / W
                y_c = ((y_min + y_max) / 2) / H
                w   = (x_max - x_min) / W
                h   = (y_max - y_min) / H
                if w > 0.001 and h > 0.001:
                    yolo_lines.append(f"0 {x_c:.6f} {y_c:.6f} {w:.6f} {h:.6f}")
            except ValueError:
                continue
    return yolo_lines

# ── Step 5: Convert all (fast — PIL size only, no full decode) ────────────────
counters = {'train': 0, 'val': 0, 'test': 0}
no_annot = 0

print("\n⚙️  Converting...")
for split, folders in split_map.items():
    for folder in folders:
        for jpg_path in glob.glob(os.path.join(folder, '*.jpg')):
            base = os.path.splitext(os.path.basename(jpg_path))[0]

            # Fast size read — PIL doesn't decode full image for JPEG
            try:
                with Image.open(jpg_path) as im:
                    W, H = im.size
            except Exception:
                continue

            # Find matching .txt annotation
            txt_path = os.path.join(folder, base + '.txt')
            if not os.path.exists(txt_path):
                alt = os.path.join(folder, base.replace('-page', '-color_page') + '.txt')
                txt_path = alt if os.path.exists(alt) else None

            # Copy image
            dst_img = os.path.join(LOCAL_YOLO, 'images', split, os.path.basename(jpg_path))
            shutil.copy2(jpg_path, dst_img)

            # Write label
            dst_lbl = os.path.join(LOCAL_YOLO, 'labels', split, base + '.txt')
            if txt_path:
                yolo_lines = ibem_to_yolo(txt_path, W, H)
                with open(dst_lbl, 'w') as f:
                    f.write('\n'.join(yolo_lines))
            else:
                open(dst_lbl, 'w').close()
                no_annot += 1

            counters[split] += 1

    n = counters[split]
    print(f"   ✅ {split}: {n} images converted")

print(f"\n   Images with no matching annotation: {no_annot}")

# ── Step 6: Create data.yaml locally ──────────────────────────────────────────
data_yaml_path = os.path.join(LOCAL_YOLO, 'data.yaml')
data_yaml_content = {
    'path':  LOCAL_YOLO,
    'train': 'images/train',
    'val':   'images/val',
    'test':  'images/test',
    'nc':    1,
    'names': ['math_formula']
}
with open(data_yaml_path, 'w') as f:
    yaml.dump(data_yaml_content, f, default_flow_style=False)

print(f"\n✅ data.yaml → {data_yaml_path}")

# ── Step 7: Copy converted dataset back to Drive for next time ────────────────
if not os.path.exists(DRIVE_YOLO):
    print("📤 Saving IBEM_yolo to Drive (runs once)...")
    shutil.copytree(LOCAL_YOLO, DRIVE_YOLO)
    print("✅ Saved to Drive!")
else:
    print("✅ IBEM_yolo already on Drive — skipped upload.")

DATA_YAML = data_yaml_path
print(f"\n📍 DATA_YAML = {DATA_YAML}")
print("▶️  Run Cell 3 to start training!")
