from flask import Flask, render_template, request, send_from_directory
import os
import shutil
import time
import uuid
from werkzeug.utils import secure_filename
from ultralytics import YOLO
import cv2
import numpy as np

# ==== CONFIG ====
app = Flask(__name__)
BASE = os.path.join(os.getcwd(), "static")

UPLOAD_FOLDER = os.path.join(BASE, "upload")
CROP_FOLDER = os.path.join(BASE, "cropped")
DEWARP_FOLDER = os.path.join(BASE, "dewarped")
PREDICTED_FOLDER = os.path.join(BASE, "predicted")
EXTRACT_FOLDER = os.path.join("offline", "extracted")

# Permanent storage folders
PERM_CROP_FOLDER = "D:/offline/cropped"
PERM_DEWARP_FOLDER = "D:/offline/dewarped"
PERM_PREDICT_FOLDER = "D:/offline/predicted"

# Load YOLO model
model = YOLO("D:/Math_Formula_Detection/best.pt")

# Create necessary directories
for folder in [UPLOAD_FOLDER, CROP_FOLDER, DEWARP_FOLDER, PREDICTED_FOLDER,
               EXTRACT_FOLDER, PERM_CROP_FOLDER, PERM_DEWARP_FOLDER, PERM_PREDICT_FOLDER]:
    os.makedirs(folder, exist_ok=True)

completed_files = []

# === FUNCTIONS ===
def crop_image(input_path, output_path):
    img = cv2.imread(input_path)
    if img is None:
        return
    h, w = img.shape[:2]
    top, bottom, left, right = 50, 50, 50, 0
    cropped = img[top:h-bottom, left:w-right]
    cv2.imwrite(output_path, cropped)

def dewarp_image(input_path, output_path):
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    temp_output = base_name + "_thresh.png"
    os.system(f"page-dewarp \"{input_path}\" > nul 2>&1")
    if os.path.exists(temp_output):
        shutil.move(temp_output, output_path)
        return True
    return False

def detect_and_save(model, image_path, save_path, extract_folder):
    results = model.predict(source=image_path, conf=0.5, iou=0.75)
    img = cv2.imread(image_path)
    if img is None:
        return
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    boxes = results[0].boxes.xyxy.cpu().numpy()
    scores = results[0].boxes.conf.cpu().numpy()
    os.makedirs(extract_folder, exist_ok=True)

    for i, box in enumerate(boxes.astype(int)):
        label = f"{scores[i]:.2f}"
        x1, y1, x2, y2 = box
        cv2.rectangle(img, (x1, y1), (x2, y2), (255, 0, 0), 2)
        cv2.putText(img, label, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)
        extracted = img[y1:y2, x1:x2]
        extract_path = os.path.join(extract_folder, f"expr_{i+1}.jpg")
        cv2.imwrite(extract_path, cv2.cvtColor(extracted, cv2.COLOR_RGB2BGR))

    cv2.imwrite(save_path, cv2.cvtColor(img, cv2.COLOR_RGB2BGR))

@app.route("/", methods=["GET", "POST"])
def index():
    results = []
    if request.method == "POST":
        files = request.files.getlist("images")
        for file in files:
            if file:
                fname = secure_filename(file.filename)
                uid = uuid.uuid4().hex
                timestamp = time.strftime("%Y%m%d_%H%M%S")
                new_name = f"{timestamp}_{fname}"
                upload_path = os.path.join(UPLOAD_FOLDER, new_name)
                file.save(upload_path)

                crop_path = os.path.join(CROP_FOLDER, new_name)
                dewarp_path = os.path.join(DEWARP_FOLDER, f"{os.path.splitext(new_name)[0]}.png")
                detect_path = os.path.join(PREDICTED_FOLDER, f"predicted_{os.path.splitext(new_name)[0]}.jpg")
                extract_dir = os.path.join(EXTRACT_FOLDER, os.path.splitext(new_name)[0])
                os.makedirs(extract_dir, exist_ok=True)

                crop_image(upload_path, crop_path)
                shutil.copy2(crop_path, os.path.join(PERM_CROP_FOLDER, new_name))

                if dewarp_image(crop_path, dewarp_path):
                    shutil.copy2(dewarp_path, os.path.join(PERM_DEWARP_FOLDER, os.path.basename(dewarp_path)))
                    detect_and_save(model, dewarp_path, detect_path, extract_dir)
                    shutil.copy2(detect_path, os.path.join(PERM_PREDICT_FOLDER, os.path.basename(detect_path)))

                    results.append({
                        "file": new_name,
                        "original": os.path.relpath(upload_path, "static").replace("\\", "/"),
                        "dewarped": os.path.relpath(dewarp_path, "static").replace("\\", "/"),
                        "detected": os.path.relpath(detect_path, "static").replace("\\", "/")
                    })
                    completed_files.append(new_name)

    return render_template("index.html", results=results, completed=completed_files)

if __name__ == "__main__":
    app.run(debug=True)
