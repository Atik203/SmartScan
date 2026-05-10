"""
SmartScan — Flask Backend API
==============================
Runs on port 5000. The Next.js dashboard (port 3000) proxies all calls here.

Start:
    cd dl-processing-engine
    python app.py

Endpoints:
    POST /process-page      Full pipeline: crop → dewarp → detect → route
    POST /recognize         TrOCR inference on a single cropped image
    GET  /status            Current queue + recent activity
    GET  /health            Arduino/Pi/model connectivity
    GET  /usage             Gemini API usage stats (internal)
    GET  /pages             List all processed pages
    GET  /pages/<int:n>     Get markdown content for page N
    GET  /book/pdf          Compile and stream the final PDF
    GET  /gallery/<name>    Serve original/cropped/dewarped/detected images
    GET  /images/<path>     Static image serving
    GET  /                  Legacy Flask template UI
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import time
import uuid
from pathlib import Path

from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS
from ultralytics import YOLO
from werkzeug.utils import secure_filename

# ── Config & utils ───────────────────────────────────────────────────────────
from config import (
    DEWARPED_FOLDER,
    EXTRACTED_FOLDER,
    MARKDOWN_OUTPUT_DIR,
    PDF_OUTPUT_PATH,
    PERM_CROP_FOLDER,
    PERM_DEWARP_FOLDER,
    PERM_PREDICT_FOLDER,
    PREDICTED_FOLDER,
    YOLO_MODEL_PATH,
    PI_IP,
    PI_USER,
    GEMINI_API_KEY,
    ensure_dirs,
)

ensure_dirs()

# ── Flask app ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

# ── Static upload/processing folders ─────────────────────────────────────────
BASE_STATIC = os.path.join(os.getcwd(), "static")
UPLOAD_FOLDER   = os.path.join(BASE_STATIC, "upload")
CROP_FOLDER     = os.path.join(BASE_STATIC, "cropped")
DEWARP_FOLDER   = os.path.join(BASE_STATIC, "dewarped")
PREDICTED_FOLDER_STATIC = os.path.join(BASE_STATIC, "predicted")
EXTRACT_FOLDER  = os.path.join(BASE_STATIC, "extracted")

for _d in [UPLOAD_FOLDER, CROP_FOLDER, DEWARP_FOLDER, PREDICTED_FOLDER_STATIC, EXTRACT_FOLDER]:
    os.makedirs(_d, exist_ok=True)

# ── Load YOLO model once ──────────────────────────────────────────────────────
_yolo_model: YOLO | None = None
_model_load_error: str | None = None

def _get_yolo() -> YOLO:
    global _yolo_model, _model_load_error
    if _yolo_model is not None:
        return _yolo_model
    if not os.path.exists(YOLO_MODEL_PATH):
        _model_load_error = f"YOLO weights not found at {YOLO_MODEL_PATH}"
        raise FileNotFoundError(_model_load_error)
    _yolo_model = YOLO(YOLO_MODEL_PATH)
    _model_load_error = None
    print(f"[App] YOLO model loaded: {YOLO_MODEL_PATH}")
    return _yolo_model

try:
    _get_yolo()
except Exception as e:
    print(f"[App] WARNING: YOLO model not loaded: {e}")

# ── In-memory state ───────────────────────────────────────────────────────────
_recent_activity: list[dict] = []   # last 50 processed files
_queue: list[str] = []              # filenames pending processing
_server_start = time.time()


def _log_activity(filename: str, status: str, details: dict | None = None):
    _recent_activity.insert(
        0,
        {
            "filename": filename,
            "status": status,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
            **(details or {}),
        },
    )
    if len(_recent_activity) > 50:
        _recent_activity.pop()


# ── Image helpers ─────────────────────────────────────────────────────────────
import cv2
import numpy as np


def _crop_image(src: str, dst: str):
    img = cv2.imread(src)
    if img is None:
        return
    h, w = img.shape[:2]
    cropped = img[50 : h - 50, 50:]
    cv2.imwrite(dst, cropped)


def _dewarp_image(src: str, dst: str) -> bool:
    base = os.path.splitext(os.path.basename(src))[0]
    tmp  = os.path.join(os.getcwd(), base + "_thresh.png")
    subprocess.run(
        ["page-dewarp", src],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    for _ in range(30):
        if os.path.exists(tmp):
            shutil.move(tmp, dst)
            return True
        time.sleep(1)
    return False


def _detect_and_save(image_path: str, save_path: str, extract_dir: str) -> list:
    """Run YOLO detection; return list of box dicts."""
    try:
        model = _get_yolo()
    except Exception:
        return []

    results = model.predict(source=image_path, conf=0.5, iou=0.75)
    img = cv2.imread(image_path)
    if img is None:
        return []

    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    boxes_raw = results[0].boxes.xyxy.cpu().numpy()
    scores    = results[0].boxes.conf.cpu().numpy()

    os.makedirs(extract_dir, exist_ok=True)
    box_list = []

    for i, box in enumerate(boxes_raw.astype(int)):
        x1, y1, x2, y2 = box
        conf = float(scores[i])
        cv2.rectangle(rgb, (x1, y1), (x2, y2), (255, 0, 0), 2)
        cv2.putText(rgb, f"{conf:.2f}", (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)
        crop = img[y1:y2, x1:x2]
        crop_path = os.path.join(extract_dir, f"expr_{i+1}.jpg")
        cv2.imwrite(crop_path, crop)
        box_list.append({"x1": int(x1), "y1": int(y1), "x2": int(x2), "y2": int(y2),
                          "confidence": round(conf, 3)})

    cv2.imwrite(save_path, cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR))
    return box_list


# ─────────────────────────────────────────────────────────────────────────────
#  ROUTES
# ─────────────────────────────────────────────────────────────────────────────

# ── POST /process-page ────────────────────────────────────────────────────────
@app.route("/process-page", methods=["POST"])
def process_page():
    """
    Full pipeline for a single uploaded image:
    upload → crop → dewarp → YOLO detect → traffic route → markdown save

    Accepts: multipart/form-data with field 'image'
    Returns: JSON with paths, detection count, latex blocks, route taken
    """
    if "image" not in request.files:
        return jsonify({"error": "Missing 'image' field"}), 400

    file = request.files["image"]
    if not file or not file.filename:
        return jsonify({"error": "Empty file"}), 400

    # Determine page number from form or auto-assign
    page_number = int(request.form.get("page_number", len(_recent_activity) + 1))

    # Save upload
    fname     = secure_filename(file.filename)
    ts        = time.strftime("%Y%m%d_%H%M%S")
    new_name  = f"{ts}_{fname}"
    upload_p  = os.path.join(UPLOAD_FOLDER, new_name)
    file.save(upload_p)

    base      = os.path.splitext(new_name)[0]
    crop_p    = os.path.join(CROP_FOLDER, new_name)
    dewarp_p  = os.path.join(DEWARP_FOLDER, base + ".png")
    detect_p  = os.path.join(PREDICTED_FOLDER_STATIC, f"predicted_{base}.jpg")
    extract_d = os.path.join(EXTRACT_FOLDER, base)

    # Pipeline
    _crop_image(upload_p, crop_p)
    shutil.copy2(crop_p, os.path.join(PERM_CROP_FOLDER, new_name))

    if not _dewarp_image(crop_p, dewarp_p):
        _log_activity(new_name, "error", {"reason": "dewarp_failed"})
        return jsonify({"error": "Dewarp failed"}), 500

    shutil.copy2(dewarp_p, os.path.join(PERM_DEWARP_FOLDER, os.path.basename(dewarp_p)))

    boxes = _detect_and_save(dewarp_p, detect_p, extract_d)
    if os.path.exists(detect_p):
        shutil.copy2(detect_p, os.path.join(PERM_PREDICT_FOLDER, os.path.basename(detect_p)))

    # Traffic routing
    from traffic_controller import route_page as _route_page
    route_result = _route_page(
        dewarped_path=dewarp_p,
        detected_boxes=boxes,
        extract_folder=extract_d,
        page_number=page_number,
    )

    _log_activity(new_name, "processed", {
        "detections": len(boxes),
        "route": route_result.get("route"),
        "page_number": page_number,
    })

    # Build relative URLs for frontend
    def _rel(path: str) -> str:
        return "/images/" + os.path.relpath(path, BASE_STATIC).replace("\\", "/")

    return jsonify({
        "success": True,
        "file": new_name,
        "page_number": page_number,
        "original": _rel(upload_p),
        "cropped": _rel(crop_p),
        "dewarped": _rel(dewarp_p),
        "detected": _rel(detect_p) if os.path.exists(detect_p) else None,
        "detections": len(boxes),
        "boxes": boxes,
        "route": route_result.get("route"),
        "markdown": route_result.get("markdown", ""),
        "latex_blocks": route_result.get("latex_blocks", []),
        "trocr_results": route_result.get("trocr_results", []),
        "markdown_path": route_result.get("markdown_path", ""),
        "latency_ms": route_result.get("latency_ms", 0),
    })


# ── POST /recognize ───────────────────────────────────────────────────────────
@app.route("/recognize", methods=["POST"])
def recognize():
    """
    Run TrOCR on a single cropped math image.
    Accepts: multipart/form-data with field 'image'
    """
    if "image" not in request.files:
        return jsonify({"error": "Missing 'image' field"}), 400

    file = request.files["image"]
    tmp_path = os.path.join(EXTRACT_FOLDER, f"tmp_{uuid.uuid4().hex}.jpg")
    file.save(tmp_path)

    try:
        from trocr_inference import get_recognizer
        rec = get_recognizer()
        result = rec.recognize(tmp_path)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    return jsonify(result)


# ── GET /status ───────────────────────────────────────────────────────────────
@app.route("/status", methods=["GET"])
def status():
    from page_assembler import list_pages

    pages = list_pages()
    total_latex = sum(p.get("latex_count", 0) for p in pages)

    return jsonify({
        "pages_scanned": len(pages),
        "formulas_detected": total_latex,
        "queue_length": len(_queue),
        "recent_activity": _recent_activity[:10],
        "uptime_seconds": int(time.time() - _server_start),
    })


# ── GET /health ───────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    # Check Pi connectivity
    pi_online = False
    try:
        r = subprocess.run(
            ["ping", "-c", "1", "-W", "1", PI_IP] if os.name != "nt"
            else ["ping", "-n", "1", "-w", "1000", PI_IP],
            capture_output=True, timeout=3,
        )
        pi_online = r.returncode == 0
    except Exception:
        pass

    # Check YOLO model
    model_loaded = _yolo_model is not None

    # Check Tesseract
    from tesseract_ocr import is_available as tess_ok
    tesseract_ok = tess_ok()

    # Check Pandoc
    try:
        pandoc_r = subprocess.run(["pandoc", "--version"], capture_output=True, timeout=5)
        pandoc_ok = pandoc_r.returncode == 0
    except Exception:
        pandoc_ok = False

    return jsonify({
        "arduino": False,          # Arduino health requires serial — shown as N/A
        "pi": pi_online,
        "pi_ip": PI_IP,
        "model_loaded": model_loaded,
        "model_error": _model_load_error,
        "tesseract": tesseract_ok,
        "pandoc": pandoc_ok,
        "gemini_configured": bool(GEMINI_API_KEY),
        "uptime_seconds": int(time.time() - _server_start),
    })


# ── GET /usage ────────────────────────────────────────────────────────────────
@app.route("/usage", methods=["GET"])
def usage():
    from gemini_router import get_usage_summary
    return jsonify(get_usage_summary())


# ── GET /pages ────────────────────────────────────────────────────────────────
@app.route("/pages", methods=["GET"])
def pages_list():
    from page_assembler import list_pages
    return jsonify({"pages": list_pages(), "total": len(list_pages())})


# ── GET /pages/<n> ────────────────────────────────────────────────────────────
@app.route("/pages/<int:page_number>", methods=["GET"])
def page_content(page_number: int):
    from page_assembler import get_page_content
    result = get_page_content(page_number)
    if not result["found"]:
        return jsonify({"error": f"Page {page_number} not found"}), 404
    return jsonify(result)


# ── GET /book/pdf ─────────────────────────────────────────────────────────────
@app.route("/book/pdf", methods=["GET"])
def book_pdf():
    """Compile (if needed) and stream the final PDF."""
    force = request.args.get("force", "false").lower() == "true"

    from page_assembler import compile_pdf
    result = compile_pdf(force=force)

    if not result["success"]:
        return jsonify({"error": result.get("error", "PDF compilation failed")}), 500

    if not os.path.exists(PDF_OUTPUT_PATH):
        return jsonify({"error": "PDF not found after compilation"}), 500

    return send_file(
        PDF_OUTPUT_PATH,
        mimetype="application/pdf",
        as_attachment=False,
        download_name="SmartScan_Book.pdf",
    )


# ── GET /gallery/<name> ───────────────────────────────────────────────────────
@app.route("/gallery/<name>", methods=["GET"])
def gallery(name: str):
    """
    Return paths to all versions of a processed image.
    <name> is the base filename without extension.
    """
    base = os.path.splitext(secure_filename(name))[0]

    def _find(folder: str, stem: str, exts=(".jpg", ".png")) -> str | None:
        for e in exts:
            p = os.path.join(folder, stem + e)
            if os.path.exists(p):
                return "/images/" + os.path.relpath(p, BASE_STATIC).replace("\\", "/")
        return None

    extract_d = os.path.join(EXTRACT_FOLDER, base)
    extracts = []
    if os.path.isdir(extract_d):
        extracts = [
            "/images/" + os.path.relpath(str(p), BASE_STATIC).replace("\\", "/")
            for p in Path(extract_d).iterdir()
            if p.suffix.lower() in (".jpg", ".jpeg", ".png")
        ]

    return jsonify({
        "name": name,
        "original": _find(UPLOAD_FOLDER, base),
        "cropped":  _find(CROP_FOLDER, base),
        "dewarped": _find(DEWARP_FOLDER, base),
        "detected": _find(PREDICTED_FOLDER_STATIC, f"predicted_{base}"),
        "extracted": sorted(extracts),
    })


# ── Static image serving ──────────────────────────────────────────────────────
@app.route("/images/<path:filepath>")
def serve_image(filepath: str):
    return send_from_directory(BASE_STATIC, filepath)


# ── Legacy template UI ────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def index_get():
    from flask import render_template
    return render_template("index.html", results=[], completed=_recent_activity)


@app.route("/", methods=["POST"])
def index_post():
    """Legacy form-based upload (keeps old Flask UI working)."""
    from flask import render_template
    results = []
    files = request.files.getlist("images")
    for file in files:
        if file:
            fname    = secure_filename(file.filename)
            new_name = f"{time.strftime('%Y%m%d_%H%M%S')}_{fname}"
            upload_p = os.path.join(UPLOAD_FOLDER, new_name)
            file.save(upload_p)
            base     = os.path.splitext(new_name)[0]
            crop_p   = os.path.join(CROP_FOLDER, new_name)
            dewarp_p = os.path.join(DEWARP_FOLDER, base + ".png")
            detect_p = os.path.join(PREDICTED_FOLDER_STATIC, f"predicted_{base}.jpg")
            extract_d = os.path.join(EXTRACT_FOLDER, base)

            _crop_image(upload_p, crop_p)
            if _dewarp_image(crop_p, dewarp_p):
                _detect_and_save(dewarp_p, detect_p, extract_d)
                results.append({
                    "file": new_name,
                    "original": "upload/" + new_name,
                    "dewarped": "dewarped/" + base + ".png",
                    "detected": "predicted/predicted_" + base + ".jpg",
                })
                _log_activity(new_name, "processed")
    return render_template("index.html", results=results, completed=_recent_activity)


# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 55)
    print("  SmartScan Flask API — http://localhost:5000")
    print("=" * 55)
    app.run(host="0.0.0.0", port=5000, debug=True)
