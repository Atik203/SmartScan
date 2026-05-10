import os

# NOTE: Folder is math_detector-2 (not math_detector) because a previous run existed
MODEL_DIR = os.path.join(RUNS_DIR, 'math_detector-2')
weights_dir = os.path.join(MODEL_DIR, 'weights')

print("🔍 Verifying training results...\n")

if os.path.exists(weights_dir):
    weights_files = os.listdir(weights_dir)
    print(f"✅ Weights folder: {weights_dir}")
    print(f"   Files: {weights_files}")

    has_best = 'best.pt' in weights_files
    has_last = 'last.pt' in weights_files
    print(f"\n   best.pt : {'✅' if has_best else '❌'}")
    print(f"   last.pt : {'✅' if has_last else '❌'}")

    if has_best:
        best_path = os.path.join(weights_dir, 'best.pt')
        size_mb = os.path.getsize(best_path) / 1e6
        print(f"\n🎉 best.pt ready! Size: {size_mb:.1f} MB")
        print(f"\n📥 DOWNLOAD THIS FILE:")
        print(f"   {best_path}")
        print(f"\n📂 Then paste it to:")
        print(f"   E:\\PROJECT\\SmartScan\\models\\best.pt")
else:
    print(f"❌ Weights folder not found at: {weights_dir}")
    print("Available folders in RUNS_DIR:")
    for f in os.listdir(RUNS_DIR):
        print(f"   {f}")

# Print full structure
print(f"\n📁 Full runs directory:")
for root, dirs, files in os.walk(MODEL_DIR):
    level = root.replace(MODEL_DIR, '').count(os.sep)
    indent = '  ' * level
    print(f"{indent}{os.path.basename(root)}/")
    for file in files[:5]:
        print(f"{indent}  {file}")
    if len(files) > 5:
        print(f"{indent}  ... and {len(files)-5} more")
