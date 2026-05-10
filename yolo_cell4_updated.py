import os

# Updated to look for the correct folder
MODEL_DIR = os.path.join(RUNS_DIR, 'math_detector')
weights_dir = os.path.join(MODEL_DIR, 'weights')

print("🔍 Verifying training results...\n")

if os.path.exists(weights_dir):
    weights_files = os.listdir(weights_dir)
    print(f"✅ Weights folder: {weights_dir}")
    
    has_best = 'best.pt' in weights_files
    has_last = 'last.pt' in weights_files
    print(f"\n   best.pt : {'✅' if has_best else '❌'}")
    print(f"   last.pt : {'✅' if has_last else '❌'}")

    if has_best:
        best_path = os.path.join(weights_dir, 'best.pt')
        size_mb = os.path.getsize(best_path) / 1e6
        print(f"\n🎉 best.pt ready! Size: {size_mb:.1f} MB")
        print(f"\n📥 DOWNLOAD COMMAND:")
        print(f"   from google.colab import files")
        print(f"   files.download('{best_path}')")
else:
    print(f"❌ Weights folder not found at: {weights_dir}")
