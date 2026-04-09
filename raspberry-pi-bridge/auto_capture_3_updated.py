import subprocess
import time
import os
import cv2

# === CONFIGURATION ===
PI_SAVE_PATH = "/home/tony/pmer/captured_images"
COUNTER_FILE = os.path.join(PI_SAVE_PATH, "page_counter.txt")

DEVICE_PATHS = {
    "RZ8M93CFR7Z": "/storage/emulated/0/DCIM/Camera", # LEFT phone
    "ZD222LM9N3": "/storage/emulated/0/DCIM/Camera"   # RIGHT phone
    ##"317f927b": "/storage/emulated/0/DCIM/Camera"
}

DEVICE_LABELS = {
    "RZ8M93CFR7Z": "left",
    "ZD222LM9N3": "right"
    ##"317f927b": "left"
}

os.makedirs(PI_SAVE_PATH, exist_ok=True)

# === UTILS ===
def load_page_counter():
    return int(open(COUNTER_FILE).read().strip()) if os.path.exists(COUNTER_FILE) else 1

def save_page_counter(counter):
    with open(COUNTER_FILE, "w") as f:
        f.write(str(counter))

def run_adb_command(command, serial=None):
    cmd = ["adb"]
    if serial:
        cmd += ["-s", serial]
    cmd += command
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return result.stdout.strip()

def take_photo(serial):
    print(f"[??] Taking photo on device: {serial}")
    run_adb_command(["shell", "input", "keyevent", "KEYCODE_CAMERA"], serial)

def get_latest_image(serial):
    phone_path = DEVICE_PATHS[serial]
    output = run_adb_command(["shell", f"ls {phone_path}"], serial)
    image_files = sorted(f for f in output.splitlines() if f.lower().endswith(".jpg"))
    if not image_files:
        raise FileNotFoundError(f"No images found on {serial}")
    return image_files[-1], phone_path

def rotate_image(image_path, direction):
    img = cv2.imread(image_path)
    if img is None:
        print(f"[ERROR] Cannot read image: {image_path}")
        return
    if direction == "left":
        rotated = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
    elif direction == "right":
        rotated = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
    else:
        rotated = img
    cv2.imwrite(image_path, rotated)
    print(f"[?] Rotated {direction}: {os.path.basename(image_path)}")

def pull_image(serial, filename, remote_path, page_number, label):
    remote_full = f"{remote_path}/{filename}"
    local_name = f"page{page_number:03d}-{label}.jpg"
    local_path = os.path.join(PI_SAVE_PATH, local_name)

    print(f"[??] Pulling {filename} from {serial} as {local_name}")
    run_adb_command(["pull", remote_full, local_path], serial)

    rotate_image(local_path, "left" if label == "left" else "right")
    return local_path

# === MAIN ===
def main():
    print("?? Starting capture sequence...")
    page_number = load_page_counter()

    for serial in DEVICE_PATHS:
        try:
            take_photo(serial)
        except Exception as e:
            print(f"[??] Failed to take photo on {serial}: {e}")

    time.sleep(3)  # Let phones save images

    for serial in DEVICE_PATHS:
        try:
            latest, path = get_latest_image(serial)
            label = DEVICE_LABELS[serial]
            pull_image(serial, latest, path, page_number, label)
            page_number += 1  # Increment after each image
        except Exception as e:
            print(f"[??] Error pulling image from {serial}: {e}")

    save_page_counter(page_number)
    print("? Image cycle complete.")

if __name__ == "__main__":
    main()

