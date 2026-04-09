import os
import cv2
import subprocess
import shutil
import time
import numpy as np
from config import EXTRACTED_FOLDER, ensure_dirs

# Ensure directories exist on import
ensure_dirs()

# --- Cropping ---
def crop_image(image_path, save_path, top_cm=10, bottom_cm=10, left_cm=5, right_cm=0, dpi=96):
    img = cv2.imread(image_path)
    if img is None:
        print(f"[ERROR] Could not read image: {image_path}")
        return
    top = int(top_cm * dpi / 2.54)
    bottom = int(bottom_cm * dpi / 2.54)
    left = int(left_cm * dpi / 2.54)
    right = int(right_cm * dpi / 2.54)
    h, w = img.shape[:2]
    cropped = img[top:h-bottom, left:w-right]
    cv2.imwrite(save_path, cropped)
    print(f"[✓] Cropped: {save_path}")

# --- Dewarping ---
def dewarp_image(cropped_path, dewarped_path):
    base_name = os.path.splitext(os.path.basename(cropped_path))[0]
    temp_output_name = base_name + "_thresh.png"
    temp_output_path = os.path.join(os.getcwd(), temp_output_name)

    print(f"[→] Starting dewarp for: {cropped_path}")
    start_time = time.time()

    subprocess.run(["page-dewarp", cropped_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    wait_time = 0
    while not os.path.exists(temp_output_path) and wait_time < 30:
        time.sleep(1)
        wait_time += 1

    if os.path.exists(temp_output_path):
        shutil.move(temp_output_path, dewarped_path)
        elapsed = time.time() - start_time
        print(f"[✓] Dewarped and moved in {elapsed:.2f} sec: {dewarped_path}")
        return True
    else:
        print(f"[ERROR] Dewarp failed for {cropped_path}")
        return False

# --- YOLOv8 Detection ---
def detect_and_save(model, image_path, save_path, conf=0.5, iou=0.75):
    print(f"[→] Starting Math Expression Detection for: {image_path}")
    start_time = time.time()

    pred = model.predict(source=image_path, conf=conf, iou=iou)
    img = cv2.imread(image_path)
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    boxes = pred[0].boxes.xyxy.cpu().numpy() if len(pred[0].boxes.xyxy) else np.array([])
    scores = pred[0].boxes.conf.cpu().numpy() if len(pred[0].boxes.conf) else []

    # Draw detections
    for i, box in enumerate(boxes.astype(int)):
        label = f"{scores[i]:.2f}"
        cv2.rectangle(rgb_img, (box[0], box[1]), (box[2], box[3]), (255, 0, 0), 2)
        cv2.putText(rgb_img, label, (box[0], box[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)

    bgr_img = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2BGR)
    cv2.imwrite(save_path, bgr_img)

    # Extract and save formula crops
    if len(boxes):
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        extract_folder = os.path.join(EXTRACTED_FOLDER, base_name)
        os.makedirs(extract_folder, exist_ok=True)

        for i, box in enumerate(boxes.astype(int)):
            x1, y1, x2, y2 = box
            formula_crop = img[y1:y2, x1:x2]
            extract_path = os.path.join(extract_folder, f"expr_{i+1}.jpg")
            cv2.imwrite(extract_path, formula_crop)

    elapsed = time.time() - start_time
    if len(boxes):
        print(f"[✓] Detection done in {elapsed:.2f} sec: {save_path} | {len(boxes)} detected and extracted")
    else:
        print(f"[✓] Detection done in {elapsed:.2f} sec: {save_path} | No detections")
