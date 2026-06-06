import subprocess
import time
import os
import cv2

# === CONFIGURATION ===
# Path to Minimal ADB
ADB_PATH = r"C:\Program Files (x86)\Minimal ADB and Fastboot\adb.exe"
# Local save directory
PI_SAVE_PATH = r"E:\PROJECT\SmartScan\SmartScan_Captures"
COUNTER_FILE = os.path.join(PI_SAVE_PATH, "page_counter.txt")

# === DEVICE CONFIG (Single phone: Redmi Note 13 Pro) ===
DEVICE_SERIAL = "868130a1"
DEVICE_CAMERA_PATH = "/storage/emulated/0/DCIM/Camera"

# Auto-capture settings
PREPROCESS_DELAY_SEC = 1
PAGE_FLIP_INTERVAL_SEC = 2
TOTAL_CAPTURES = 10  # Each capture yields 2 book pages

# Track the last pulled filename for duplicate prevention
last_filename = ""

os.makedirs(PI_SAVE_PATH, exist_ok=True)


# === UTILS ===
def run_adb_command(command, serial=None):
    if not os.path.exists(ADB_PATH):
        print(f"ERROR: adb.exe not found at: {ADB_PATH}")
        return ""
    cmd = [ADB_PATH]
    if serial:
        cmd += ["-s", serial]
    cmd += command
    try:
        result = subprocess.run(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )
        return result.stdout.strip()
    except Exception as e:
        print(f"Subprocess Error: {e}")
        return ""


def load_page_counter():
    if os.path.exists(COUNTER_FILE):
        with open(COUNTER_FILE, "r") as f:
            return int(f.read().strip())
    return 1


def save_page_counter(counter):
    with open(COUNTER_FILE, "w") as f:
        f.write(str(counter))


def take_photo():
    print(f"[*] Triggering shutter on Redmi Note 13 Pro ({DEVICE_SERIAL})")
    # Force Camera App to front
    run_adb_command(
        ["shell", "monkey", "-p", "com.android.camera", "1"], DEVICE_SERIAL
    )
    time.sleep(0.5)
    # Use Keycode 66 (ENTER) to trigger shutter
    run_adb_command(["shell", "input", "keyevent", "66"], DEVICE_SERIAL)


def get_latest_image():
    global last_filename
    output = run_adb_command(
        ["shell", f"ls -t {DEVICE_CAMERA_PATH}"], DEVICE_SERIAL
    )

    # Filter for JPG files (case-insensitive)
    image_files = [f for f in output.splitlines() if f.lower().endswith(".jpg")]

    if not image_files:
        return None, None

    newest_file = image_files[0]

    # Duplicate check
    if newest_file == last_filename:
        print(f"[⚠️ WARNING] Same file returned again: {newest_file} — photo may not have been taken.")
        return "DUPLICATE", DEVICE_CAMERA_PATH

    last_filename = newest_file
    return newest_file, DEVICE_CAMERA_PATH


def rotate_and_split(image_path, capture_num):
    """
    Rotate the raw 2-page landscape capture 90° clockwise, then split
    at the horizontal midpoint to produce two individual page images.

    After rotating CW a landscape shot (width > height):
      - The image becomes portrait (height > width)
      - Top half  → left book page  → saved as page_{2N-1:03d}.jpg
      - Bottom half → right book page → saved as page_{2N:03d}.jpg

    Returns (left_path, right_path) or (None, None) on failure.
    """
    img = cv2.imread(image_path)
    if img is None:
        print(f"[ERROR] Cannot read image: {image_path}")
        return None, None

    # Rotate 90° clockwise
    rotated = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
    h, w = rotated.shape[:2]

    # Split at mid-height
    mid = h // 2
    top_half    = rotated[:mid, :]   # left book page (when book opens toward camera)
    bottom_half = rotated[mid:, :]   # right book page

    left_page_num  = 2 * capture_num - 1
    right_page_num = 2 * capture_num

    left_name  = f"page_{left_page_num:03d}.jpg"
    right_name = f"page_{right_page_num:03d}.jpg"
    left_path  = os.path.join(PI_SAVE_PATH, left_name)
    right_path = os.path.join(PI_SAVE_PATH, right_name)

    cv2.imwrite(left_path, top_half)
    cv2.imwrite(right_path, bottom_half)

    print(f"[✂] Split → {left_name} ({top_half.shape[1]}×{top_half.shape[0]}) "
          f"| {right_name} ({bottom_half.shape[1]}×{bottom_half.shape[0]})")
    return left_path, right_path


def pull_image(filename, remote_path, capture_num):
    """Pull the raw capture from the phone, rotate, split, then remove the raw file."""
    global last_filename

    remote_full = f"{remote_path}/{filename}"
    raw_name    = f"capture_{capture_num:03d}_raw.jpg"
    raw_path    = os.path.join(PI_SAVE_PATH, raw_name)

    print(f"[+] Pulling {filename} → {raw_name}")
    run_adb_command(["pull", remote_full, raw_path], DEVICE_SERIAL)

    if not os.path.exists(raw_path):
        print(f"[ERROR] Pull failed — file not found locally: {raw_path}")
        return

    left_path, right_path = rotate_and_split(raw_path, capture_num)

    # Remove the raw file to keep SmartScan_Captures clean
    if left_path and right_path:
        os.remove(raw_path)
        print(f"[🗑] Removed raw file: {raw_name}")
    else:
        print(f"[⚠️] Split failed — keeping raw file for inspection: {raw_name}")


# === MAIN ===
def capture_page(capture_num):
    """Trigger shutter, wait for ISP, pull and split the image."""
    take_photo()

    print("⏳ Waiting for image processing...")
    time.sleep(5)

    try:
        latest, path = get_latest_image()
        if latest == "DUPLICATE":
            print("[!] No new image detected — skipping pull.")
        elif latest:
            pull_image(latest, path, capture_num)
        else:
            print("[!] No images found on device.")
    except Exception as e:
        print(f"[ERROR] {e}")

    save_page_counter(capture_num + 1)
    print(f"✅ Capture {capture_num} complete "
          f"(book pages {2*capture_num-1} & {2*capture_num}).\n")


def main():
    print("🚀 SmartScan — Single-Phone Capture Mode")
    print(f"   Device : Redmi Note 13 Pro ({DEVICE_SERIAL})")
    print(f"   Mode   : 2 pages per capture (rotate 90°CW + split)")
    print("=" * 50)

    capture_num = load_page_counter()

    print(f"⏳ Pre-capture delay: {PREPROCESS_DELAY_SEC}s")
    time.sleep(PREPROCESS_DELAY_SEC)

    for i in range(TOTAL_CAPTURES):
        capture_page(capture_num)
        capture_num += 1
        if i < TOTAL_CAPTURES - 1:
            print(f"🔁 Waiting {PAGE_FLIP_INTERVAL_SEC}s for page flip...")
            time.sleep(PAGE_FLIP_INTERVAL_SEC)

    print("🎉 All captures complete!")


if __name__ == "__main__":
    main()
