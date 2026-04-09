import os
import time
import subprocess
from processing import crop_image, dewarp_image, detect_and_save
from ultralytics import YOLO
from config import (
    PI_IP, PI_USER, PI_FOLDER,
    LOCAL_FOLDER, CROPPED_FOLDER, DEWARPED_FOLDER, PREDICTED_FOLDER,
    YOLO_MODEL_PATH, QUEUE_FILE, PROCESSED_FILE, CSV_LOG_FILE,
    LOGS_DIR, ensure_dirs,
)

# ==== Setup ====
ensure_dirs()
os.makedirs(LOGS_DIR, exist_ok=True)

model = YOLO(YOLO_MODEL_PATH)

def load_list(file_path):
    return set(open(file_path).read().splitlines()) if os.path.exists(file_path) else set()

def save_to_list(file_path, items):
    with open(file_path, 'a') as f:
        for item in items:
            f.write(item + '\n')


def get_image_list_from_pi():
    print("------------------------------------------------------------------")
    print("📡 Checking Pi for new images...")
    cmd = f'ssh {PI_USER}@{PI_IP} "ls {PI_FOLDER}"'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

    if result.returncode != 0:
        print("[ERROR] SSH connection failed")
        return []

    return [f.strip() for f in result.stdout.splitlines() if f.lower().endswith('.jpg')]

def pull_image_from_pi(filename):
    remote_path = f"{PI_USER}@{PI_IP}:{PI_FOLDER}{filename}"
    local_path = os.path.join(LOCAL_FOLDER, filename)
    cmd = f"scp {remote_path} {local_path}"
    result = subprocess.run(cmd, shell=True)
    return result.returncode == 0

def update_queue():
    processed = load_list(PROCESSED_FILE)
    queued = load_list(QUEUE_FILE)
    current_images = get_image_list_from_pi()


    new_images = [img for img in current_images if img not in processed and img not in queued]
    if new_images:
        save_to_list(QUEUE_FILE, new_images)
        print(f"[+] Added {len(new_images)} new image(s) to queue: {new_images}")

def process_one():
    if not os.path.exists(QUEUE_FILE):
        return
    with open(QUEUE_FILE, 'r') as f:
        queue = f.read().splitlines()
    if not queue:
        return
    img_name = queue[0]
    print(f"🔄 Processing: {img_name}")

    if not pull_image_from_pi(img_name):
        print(f"[ERROR] Failed to pull {img_name}")
        return

    base = os.path.splitext(img_name)[0]
    original = os.path.join(LOCAL_FOLDER, img_name)
    cropped = os.path.join(CROPPED_FOLDER, img_name)
    dewarped = os.path.join(DEWARPED_FOLDER, base + ".png")
    predicted = os.path.join(PREDICTED_FOLDER, f"predicted_{base}.jpg")

    crop_image(original, cropped)
    if dewarp_image(cropped, dewarped):
        detect_and_save(model, dewarped, predicted)
        print(f"[✓] Finished: {img_name}")

        # Update logs
        with open(QUEUE_FILE, 'w') as f:
            f.writelines(line + '\n' for line in queue[1:])
        save_to_list(PROCESSED_FILE, [img_name])

        # After detect_and_save(...) call:
        with open(CSV_LOG_FILE, 'a') as log:
            log.write(f"{img_name},{time.strftime('%Y-%m-%d %H:%M:%S')}\n")


def main_loop():
    print("🚀 Listening for images from Pi...")
    while True:
        update_queue()
        process_one()
        time.sleep(5)  # Every 5 seconds

if __name__ == "__main__":
    main_loop()