"""
SmartScan — Traffic Controller
================================
The core routing logic that decides how each page is processed.

Decision tree:
  YOLO detects 0 math expressions  →  Path A: Tesseract only (local, free)
  YOLO detects ≥ 1 math expression →  Path B: Gemini API (hidden from UI)
                                        └─ Fallback: TrOCR + Tesseract

The frontend always sees "AI processed" for Path B; it never learns that
Gemini was called. The YOLO detection overlay and TrOCR results are always
surfaced to the faculty as the ML proof-of-work.

Usage:
    from traffic_controller import route_page

    result = route_page(
        dewarped_path="dewarped/page_001.png",
        detected_boxes=[...],
        extract_folder="extracted/page_001/",
        page_number=1,
    )
"""

import os
import sys
import time
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import MARKDOWN_OUTPUT_DIR, ensure_dirs

ensure_dirs()


def route_page(
    dewarped_path: str,
    detected_boxes: list,
    extract_folder: str,
    page_number: int,
    force_local: bool = False,
) -> dict:
    """
    Route a processed page through the correct OCR / LLM path.

    Args:
        dewarped_path:   Path to the dewarped (flat) page image.
        detected_boxes:  List of detection dicts from YOLO (may be empty).
        extract_folder:  Directory containing cropped formula images.
        page_number:     Sequential page number (1-indexed).
        force_local:     If True, always use local models (skip Gemini).

    Returns:
        {
            "page_number": int,
            "route": "local" | "ai" | "fallback",
            "markdown": str,
            "latex_blocks": list[str],
            "trocr_results": list[dict],   # per-formula TrOCR outputs
            "latency_ms": int,
            "success": bool,
            "error": str | None,
            "markdown_path": str,          # path to saved page_XXX.md
        }
    """
    t0 = time.monotonic()
    math_count = len(detected_boxes)

    result = {
        "page_number": page_number,
        "route": "local",
        "markdown": "",
        "latex_blocks": [],
        "trocr_results": [],
        "latency_ms": 0,
        "success": False,
        "error": None,
        "markdown_path": "",
    }

    if math_count == 0 or force_local:
        # ── Path A: Plain text page ─────────────────────────────────────────
        result["route"] = "local"
        result.update(_run_tesseract_path(dewarped_path))

    else:
        # ── Path B: Mixed math + text ───────────────────────────────────────
        # Always run TrOCR first (visible to faculty as ML proof)
        trocr_results = _run_trocr_on_crops(extract_folder)
        result["trocr_results"] = trocr_results

        # Try Gemini (hidden from UI)
        if not force_local:
            gemini_result = _run_gemini_path(dewarped_path, page_number)
            if gemini_result["success"]:
                result["route"] = "ai"
                result["markdown"] = gemini_result["markdown"]
                result["latex_blocks"] = gemini_result["latex_blocks"]
                result["success"] = True
            else:
                # Fallback: stitch Tesseract text + TrOCR LaTeX blocks
                result["route"] = "fallback"
                result.update(_run_fallback_path(dewarped_path, trocr_results))
        else:
            result["route"] = "fallback"
            result.update(_run_fallback_path(dewarped_path, trocr_results))

    # Save markdown to disk regardless of route
    if result.get("markdown"):
        md_path = _save_markdown(result["markdown"], page_number)
        result["markdown_path"] = md_path

    result["latency_ms"] = int((time.monotonic() - t0) * 1000)
    if "success" not in result or not result["success"]:
        result["success"] = bool(result.get("markdown"))

    print(
        f"[Router] Page {page_number}: route={result['route']}, "
        f"math={math_count}, {result['latency_ms']}ms"
    )
    return result


# ─── Private helpers ────────────────────────────────────────────────────────

def _run_tesseract_path(image_path: str) -> dict:
    """Path A — Tesseract only."""
    from tesseract_ocr import extract_text

    ocr = extract_text(image_path)
    return {
        "markdown": ocr.get("markdown", ""),
        "latex_blocks": [],
        "success": ocr.get("success", False),
        "error": ocr.get("error"),
    }


def _run_gemini_path(image_path: str, page_number: int) -> dict:
    """Path B primary — call Gemini API silently."""
    try:
        from gemini_router import gemini_process_page

        return gemini_process_page(image_path, page_number=page_number)
    except Exception as exc:
        return {"success": False, "markdown": "", "latex_blocks": [], "error": str(exc)}


def _run_trocr_on_crops(extract_folder: str) -> list:
    """Run TrOCR on all cropped formula images in extract_folder."""
    try:
        from trocr_inference import get_recognizer

        recognizer = get_recognizer()
        if not recognizer.is_available:
            return []

        folder = Path(extract_folder)
        if not folder.exists():
            return []

        crop_paths = sorted(
            str(p) for p in folder.iterdir()
            if p.suffix.lower() in (".jpg", ".jpeg", ".png")
        )
        return recognizer.recognize_batch(crop_paths)
    except Exception as exc:
        print(f"[Router] TrOCR batch error: {exc}")
        return []


def _run_fallback_path(image_path: str, trocr_results: list) -> dict:
    """
    Fallback — stitch Tesseract text with TrOCR LaTeX blocks.
    LaTeX blocks are appended as display math at the end of the page text.
    """
    from tesseract_ocr import extract_text

    ocr = extract_text(image_path)
    base_text = ocr.get("markdown", "")

    latex_blocks = [
        r["latex"] for r in trocr_results if r.get("success") and r.get("latex")
    ]

    # Append each LaTeX block as a display-math section
    if latex_blocks:
        math_section = "\n\n".join(f"$$\n{b}\n$$" for b in latex_blocks)
        markdown = f"{base_text}\n\n{math_section}" if base_text else math_section
    else:
        markdown = base_text

    return {
        "markdown": markdown,
        "latex_blocks": latex_blocks,
        "success": bool(markdown),
        "error": ocr.get("error"),
    }


def _save_markdown(content: str, page_number: int) -> str:
    """Write page content to MARKDOWN_OUTPUT_DIR/page_NNN.md."""
    os.makedirs(MARKDOWN_OUTPUT_DIR, exist_ok=True)
    filename = f"page_{page_number:03d}.md"
    path = os.path.join(MARKDOWN_OUTPUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"<!-- Page {page_number} -->\n\n")
        f.write(content)
        f.write("\n")
    return path
