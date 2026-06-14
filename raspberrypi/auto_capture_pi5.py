import subprocess
import time
import os
import shutil
import sys
import cv2

# === CONFIGURATION (Raspberry Pi 5) ===
ADB_PATH = "adb"
PI_SAVE_PATH = "/home/simplex/SmartScan_Captures"
COUNTER_FILE = os.path.join(PI_SAVE_PATH, "page_counter.txt")

# === LAPTOP UPLOAD CONFIG ===
# Set to your laptop's IP address (e.g. "http://10.15.27.56:5000")
LAPTOP_URL = "http://10.15.27.56:5000"

# === DEVICE CONFIG ===
# Only ONE phone is used at a time. Comment/uncomment to switch devices.

# --- Option A: Redmi Note 13 Pro (currently active) ---
DEVICE_SERIAL      = "868130a1"
DEVICE_CAMERA_PATH = "/storage/emulated/0/DCIM/Camera"

# --- Option B: Vivo X300 Pro (comment out Option A and uncomment below to switch) ---
# DEVICE_SERIAL      = "10AFBB2BKT00367"
# DEVICE_CAMERA_PATH = "/storage/emulated/0/DCIM/Camera"

# Auto-capture settings
PREPROCESS_DELAY_SEC = 1
PAGE_FLIP_INTERVAL_SEC = 2
TOTAL_CAPTURES = 10  # Each capture = 1 spread (2 book pages in one image)

# Track last pulled filename for duplicate prevention
last_filename = ""

os.makedirs(PI_SAVE_PATH, exist_ok=True)


# === UTILS ===
def run_adb_command(command, serial=None):
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


def resolve_adb_path():
    if os.path.isabs(ADB_PATH) or "/" in ADB_PATH:
        return ADB_PATH if os.path.exists(ADB_PATH) else None
    return shutil.which(ADB_PATH)


def fail_fast(message):
    print(f"[ERROR] {message}")
    sys.exit(1)


def ensure_adb_ready():
    global ADB_PATH
    resolved = resolve_adb_path()
    if not resolved:
        fail_fast(
            "adb not found. Install android-tools-adb or set ADB_PATH to a full path."
        )
    ADB_PATH = resolved

    result = subprocess.run(
        [ADB_PATH, "devices"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    if result.returncode != 0:
        details = result.stderr.strip() or result.stdout.strip()
        fail_fast(f"adb devices failed. {details}")

    lines = [line.strip() for line in result.stdout.splitlines() if line.strip()]
    device_lines = [line for line in lines[1:] if "\tdevice" in line]
    if not device_lines:
        fail_fast(
            "No devices detected by adb. Check USB, enable USB debugging, "
            "and accept the RSA prompt."
        )

    detected = {line.split()[0] for line in device_lines}
    if DEVICE_SERIAL not in detected:
        fail_fast(
            f"Redmi Note 13 Pro ({DEVICE_SERIAL}) not found. "
            f"Detected devices: {', '.join(sorted(detected))}"
        )

    print(f"[ADB] Redmi Note 13 Pro ({DEVICE_SERIAL}) connected OK.")


def upload_to_laptop(file_path, filename):
    if not LAPTOP_URL:
        print("[Upload] LAPTOP_URL not configured. Image saved locally only.")
        return False

    print(f"[Upload] Uploading {filename} to laptop at {LAPTOP_URL}...")
    try:
        # Try to use requests if installed
        try:
            import requests
            with open(file_path, 'rb') as f:
                files = {'image': (filename, f, 'image/jpeg')}
                r = requests.post(f"{LAPTOP_URL}/upload-capture", files=files, timeout=15)
                if r.status_code == 200:
                    print(f"[Upload] Success! Laptop response: {r.json().get('message')}")
                    return True
                else:
                    print(f"[Upload] Failed with status code {r.status_code}: {r.text}")
                    return False
        except ImportError:
            # Fallback to standard library urllib.request
            import urllib.request
            
            boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
            data = []
            data.append(f'--{boundary}'.encode('utf-8'))
            data.append(f'Content-Disposition: form-data; name="image"; filename="{filename}"'.encode('utf-8'))
            data.append('Content-Type: image/jpeg'.encode('utf-8'))
            data.append(b'')
            with open(file_path, 'rb') as f:
                data.append(f.read())
            data.append(f'--{boundary}--'.encode('utf-8'))
            data.append(b'')
            
            body = b'\r\n'.join(data)
            
            req = urllib.request.Request(
                f"{LAPTOP_URL}/upload-capture",
                data=body,
                headers={
                    'Content-Type': f'multipart/form-data; boundary={boundary}',
                    'Content-Length': str(len(body))
                },
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                resp_data = response.read().decode('utf-8')
                print(f"[Upload] Success! Laptop response: {resp_data}")
                return True
    except Exception as e:
        print(f"[Upload] ERROR: Failed to upload file to laptop. Details: {e}")
        return False


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
    run_adb_command(
        ["shell", "monkey", "-p", "com.android.camera", "1"], DEVICE_SERIAL
    )
    time.sleep(0.5)
    run_adb_command(["shell", "input", "keyevent", "66"], DEVICE_SERIAL)


def get_latest_image():
    global last_filename
    output = run_adb_command(
        ["shell", f"ls -t {DEVICE_CAMERA_PATH}"], DEVICE_SERIAL
    )
    image_files = [f for f in output.splitlines() if f.lower().endswith(".jpg")]
    if not image_files:
        return None, None
    newest_file = image_files[0]
    if newest_file == last_filename:
        print(f"[WARNING] Same file returned again: {newest_file} — photo may not have been taken.")
        return "DUPLICATE", DEVICE_CAMERA_PATH
    last_filename = newest_file
    return newest_file, DEVICE_CAMERA_PATH


def rotate_spread(image_path, capture_num):
    """
    Rotate the raw capture 90° CCW (left) so the 2-page book spread
    is upright, then save as a single full-spread image.

    Naming: page_NNN_MMM.jpg  where NNN = left page, MMM = right page
      Capture 1 → page_001_002.jpg
      Capture 2 → page_003_004.jpg
      ...

    The full spread goes to the backend pipeline as one image:
    → dewarp → YOLO detect → Gemini/Tesseract OCR both pages at once.

    Returns the saved spread path, or None on failure.
    """
    img = cv2.imread(image_path)
    if img is None:
        print(f"[ERROR] Cannot read image: {image_path}")
        return None

    # Rotate 90° counter-clockwise (left)
    rotated = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
    h, w = rotated.shape[:2]

    left_page_num  = 2 * capture_num - 1
    right_page_num = 2 * capture_num
    spread_name = f"page_{left_page_num:03d}_{right_page_num:03d}.jpg"
    spread_path = os.path.join(PI_SAVE_PATH, spread_name)

    cv2.imwrite(spread_path, rotated)
    print(f"[Spread] Saved: {spread_name} ({w}x{h})")
    return spread_path


def pull_image(filename, remote_path, capture_num):
    """
    Pull the raw capture from the phone, rotate 90° CCW, save as a
    full-spread image. The raw file is also kept for inspection.
    """
    remote_full = f"{remote_path}/{filename}"
    raw_name    = f"capture_{capture_num:03d}_raw.jpg"
    raw_path    = os.path.join(PI_SAVE_PATH, raw_name)

    print(f"[+] Pulling {filename} -> {raw_name}")
    run_adb_command(["pull", remote_full, raw_path], DEVICE_SERIAL)

    if not os.path.exists(raw_path):
        print(f"[ERROR] Pull failed — file not found locally: {raw_path}")
        return

    spread_path = rotate_spread(raw_path, capture_num)
    print(f"[SAVE] Raw file kept: {raw_name}")

    if spread_path and os.path.exists(spread_path):
        upload_to_laptop(spread_path, os.path.basename(spread_path))


# === MAIN ===
def capture_page(capture_num):
    """Trigger shutter, wait for ISP, pull and rotate the spread."""
    take_photo()
    print("Waiting for image processing...")
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
    left_p  = 2 * capture_num - 1
    right_p = 2 * capture_num
    print(f"Capture {capture_num} complete -> page_{left_p:03d}_{right_p:03d}.jpg\n")


def main():
    ensure_adb_ready()
    print("SmartScan — Full-Spread Capture Mode")
    print(f"  Device : Redmi Note 13 Pro ({DEVICE_SERIAL})")
    print(f"  Mode   : 2 pages per capture, saved as one spread image (rotate 90 CCW)")
    print("=" * 55)

    capture_num = load_page_counter()
    print(f"Pre-capture delay: {PREPROCESS_DELAY_SEC}s")
    time.sleep(PREPROCESS_DELAY_SEC)

    for i in range(TOTAL_CAPTURES):
        capture_page(capture_num)
        capture_num += 1
        if i < TOTAL_CAPTURES - 1:
            print(f"Waiting {PAGE_FLIP_INTERVAL_SEC}s for page flip...")
            time.sleep(PAGE_FLIP_INTERVAL_SEC)

    print("All captures complete!")


if __name__ == "__main__":
    main()
