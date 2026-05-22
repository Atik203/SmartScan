import os
import cv2
import shutil
import time
import numpy as np
from ultralytics import YOLO
from config import PERM_EXTRACT_FOLDER, ensure_dirs

# Ensure directories exist on import
ensure_dirs()

# --- Cropping ---
def crop_image(image_path, save_path, top_cm=5, bottom_cm=5, left_cm=5, right_cm=0, dpi=96):
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

def clean_and_crop_dewarped_image(image_path: str):
    """
    Cleans up curved black borders and corners from page-dewarp output.
    Finds the largest white contour (the page paper), masks out everything else
    to white (255), and crops the image to the bounding box of the page.
    """
    img = cv2.imread(image_path)
    if img is None:
        return

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img

    # Threshold to binary (ensure paper is 255, ink/borders are 0)
    _, thresh = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)

    # Find external contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return

    # Find the largest contour by area
    largest_contour = max(contours, key=cv2.contourArea)

    # Bounding box of the largest contour
    x, y, w, h = cv2.boundingRect(largest_contour)
    img_h, img_w = img.shape[:2]

    # Validate size (must be at least 30% of the image)
    if w < img_w * 0.3 or h < img_h * 0.3:
        return

    # Create mask of the page contour
    mask = np.zeros_like(gray)
    cv2.drawContours(mask, [largest_contour], -1, 255, -1)

    # Set all pixels outside the page contour to white (255)
    cleaned_img = img.copy()
    cleaned_img[mask == 0] = 255

    # Crop to the bounding rect of the page with a tiny padding
    pad = 10
    x1 = max(0, x + pad)
    y1 = max(0, y + pad)
    x2 = min(img_w, x + w - pad)
    y2 = min(img_h, y + h - pad)

    if x2 > x1 and y2 > y1:
        cropped = cleaned_img[y1:y2, x1:x2]
        cv2.imwrite(image_path, cropped)
    else:
        cv2.imwrite(image_path, cleaned_img)

# --- Dewarping ---
def dewarp_image(cropped_path, dewarped_path):
    base_name = os.path.splitext(os.path.basename(cropped_path))[0]
    temp_output_name = base_name + "_thresh.png"
    temp_output_path = os.path.join(os.getcwd(), temp_output_name)

    print(f"[→] Starting dewarp for: {cropped_path}")
    start_time = time.time()

    os.system(f"page-dewarp \"{cropped_path}\" > nul 2>&1")

    wait_time = 0
    while not os.path.exists(temp_output_path) and wait_time < 30:
        time.sleep(1)
        wait_time += 1

    if os.path.exists(temp_output_path):
        shutil.move(temp_output_path, dewarped_path)
        clean_and_crop_dewarped_image(dewarped_path)
        elapsed = time.time() - start_time
        print(f"[✓] Dewarped, cleaned and moved in {elapsed:.2f} sec: {dewarped_path}")
        return True
    else:
        print(f"[ERROR] Dewarp failed for {cropped_path}")
        return False

# --- Move extracted folder to offline storage ---
def move_extracted_to_offline(temp_extract_path):
    os.makedirs(PERM_EXTRACT_FOLDER, exist_ok=True)
    subdir_name = os.path.basename(temp_extract_path)
    dest_path = os.path.join(PERM_EXTRACT_FOLDER, subdir_name)
    if os.path.exists(dest_path):
        shutil.rmtree(dest_path)
    shutil.move(temp_extract_path, dest_path)
    print(f"[✓] Extracted folder moved to: {dest_path}")

# --- Math Extraction  ---
def detect_and_save(model, image_path, save_path, extract_folder, conf=0.5, iou=0.75):
    print(f"[→] Starting Math Extraction detection for: {image_path}")
    start_time = time.time()

    pred = model.predict(source=image_path, conf=conf, iou=iou)
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    if len(pred[0].boxes.xyxy):
        boxes = pred[0].boxes.xyxy.cpu().numpy()
        scores = pred[0].boxes.conf.cpu().numpy()
        os.makedirs(extract_folder, exist_ok=True)
        for i, box in enumerate(boxes.astype(int)):
            label = f"{scores[i]:.2f}"
            cv2.rectangle(img, (box[0], box[1]), (box[2], box[3]), (255, 0, 0), 2)
            cv2.putText(img, label, (box[0], box[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)
            crop = img[box[1]:box[3], box[0]:box[2]]
            crop_path = os.path.join(extract_folder, f"formula_{i+1}.jpg")
            cv2.imwrite(crop_path, cv2.cvtColor(crop, cv2.COLOR_RGB2BGR))

        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        cv2.imwrite(save_path, img)

        # Move extracted folder to offline location
        move_extracted_to_offline(extract_folder)

    elapsed = time.time() - start_time
    num_detected = len(pred[0].boxes.xyxy)
    if num_detected:
        print(f"[✓] Math Extraction done in {elapsed:.2f} sec: {save_path} | {num_detected} detected")
    else:
        print(f"[✓] Math Extraction done in {elapsed:.2f} sec: {save_path} | No detections")
