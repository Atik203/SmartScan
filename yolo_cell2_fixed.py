import os, shutil, yaml, glob
from pathlib import Path

# ==============================================================================
# CELL 2 v3: IBEM → YOLO (FIXED - percentages, 2 classes)
# Format: x_rel  y_rel  width  height  class  (all as % of image, 0-100)
# Classes: 0=embedded (inline math), 1=isolated (display/block math)
# ==============================================================================

EXTRACT_PATH = os.path.join(DATASET_DIR, 'IBEM_data')
LOCAL_EXTRACT = '/content/IBEM_data'
LOCAL_YOLO    = '/content/IBEM_yolo_v2'        # new clean folder
DRIVE_YOLO    = os.path.join(DATASET_DIR, 'IBEM_yolo_v2')

# ── Step 1: Copy from Drive → /content/ if needed ────────────────────────────
if not os.path.exists(LOCAL_EXTRACT) or len(os.listdir(LOCAL_EXTRACT)) == 0:
    print("⚡ Copying IBEM_data from Drive → /content/...")
    shutil.copytree(EXTRACT_PATH, LOCAL_EXTRACT)
    print("✅ Done.")
else:
    print("✅ /content/IBEM_data already exists.")

# ── Step 2: Group Tr*/Va*/Ts* folders ─────────────────────────────────────────
split_map = {}
for folder in sorted(os.listdir(LOCAL_EXTRACT)):
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

# ── Step 3: Create YOLO dirs ──────────────────────────────────────────────────
if os.path.exists(LOCAL_YOLO):
    shutil.rmtree(LOCAL_YOLO)     # clean slate
for split in ['train', 'val', 'test']:
    os.makedirs(os.path.join(LOCAL_YOLO, 'images', split), exist_ok=True)
    os.makedirs(os.path.join(LOCAL_YOLO, 'labels', split), exist_ok=True)

# ── Step 4: Converter (FIXED) ─────────────────────────────────────────────────
def ibem_to_yolo(txt_path):
    """
    IBEM format (already percentage-based, 0-100):
      x_rel   y_rel   width   height   class
    where x_rel,y_rel = top-left corner as % of image dimensions.

    YOLO format (0-1):
      class  x_center  y_center  width  height
    """
    yolo_lines = []
    with open(txt_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue                        # skip comment/empty lines
            parts = line.split()
            if len(parts) < 4:
                continue
            try:
                x_rel   = float(parts[0])       # top-left x (%)
                y_rel   = float(parts[1])        # top-left y (%)
                w_pct   = float(parts[2])        # width (%)
                h_pct   = float(parts[3])        # height (%)
                cls     = int(float(parts[4])) if len(parts) >= 5 else 0

                # Convert percentage → YOLO normalized (0-1)
                x_c = (x_rel + w_pct / 2) / 100.0
                y_c = (y_rel + h_pct / 2) / 100.0
                w   = w_pct  / 100.0
                h   = h_pct  / 100.0

                # Clamp to [0, 1]
                x_c = max(0.0, min(1.0, x_c))
                y_c = max(0.0, min(1.0, y_c))
                w   = max(0.001, min(1.0, w))
                h   = max(0.001, min(1.0, h))

                yolo_lines.append(f"{cls} {x_c:.6f} {y_c:.6f} {w:.6f} {h:.6f}")
            except (ValueError, IndexError):
                continue
    return yolo_lines

# ── Step 5: Convert all ───────────────────────────────────────────────────────
counters  = {'train': 0, 'val': 0, 'test': 0}
total_boxes = {'train': 0, 'val': 0, 'test': 0}
no_annot  = 0

print("\n⚙️  Converting with FIXED format...")
for split, folders in split_map.items():
    for folder in folders:
        for jpg_path in glob.glob(os.path.join(folder, '*.jpg')):
            base = os.path.splitext(os.path.basename(jpg_path))[0]

            # Match paired txt: same base name OR color_ variant
            txt_path = os.path.join(folder, base + '.txt')
            if not os.path.exists(txt_path):
                alt = os.path.join(folder, base.replace('-page', '-color_page') + '.txt')
                txt_path = alt if os.path.exists(alt) else None

            # Copy image
            dst_img = os.path.join(LOCAL_YOLO, 'images', split, os.path.basename(jpg_path))
            shutil.copy2(jpg_path, dst_img)

            # Write YOLO label
            dst_lbl = os.path.join(LOCAL_YOLO, 'labels', split, base + '.txt')
            if txt_path:
                lines = ibem_to_yolo(txt_path)
                with open(dst_lbl, 'w') as f:
                    f.write('\n'.join(lines))
                total_boxes[split] += len(lines)
            else:
                open(dst_lbl, 'w').close()
                no_annot += 1

            counters[split] += 1

print(f"\n✅ Conversion results:")
for split in ['train', 'val', 'test']:
    n = counters[split]
    b = total_boxes[split]
    avg = b / n if n > 0 else 0
    print(f"   {split:6s}: {n} images | {b} boxes | {avg:.1f} boxes/image avg")
print(f"   Images with no paired annotation: {no_annot}")

# ── Step 6: Create data.yaml ──────────────────────────────────────────────────
data_yaml_path = os.path.join(LOCAL_YOLO, 'data.yaml')
data_yaml_content = {
    'path':  LOCAL_YOLO,
    'train': 'images/train',
    'val':   'images/val',
    'test':  'images/test',
    'nc':    2,                                # 2 classes!
    'names': ['embedded', 'isolated']          # 0=inline, 1=display math
}
with open(data_yaml_path, 'w') as f:
    yaml.dump(data_yaml_content, f, default_flow_style=False)

print(f"\n✅ data.yaml → {data_yaml_path}")
print(f"   nc=2, classes: embedded (inline), isolated (display)")

# ── Step 7: Save to Drive ─────────────────────────────────────────────────────
if os.path.exists(DRIVE_YOLO):
    shutil.rmtree(DRIVE_YOLO)
print("📤 Saving IBEM_yolo_v2 to Drive...")
shutil.copytree(LOCAL_YOLO, DRIVE_YOLO)
print("✅ Saved!")

DATA_YAML = data_yaml_path
print(f"\n📍 DATA_YAML = {DATA_YAML}")
print("▶️  Run Cell 3 to retrain with CORRECT annotations!")
