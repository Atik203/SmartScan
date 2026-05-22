"""
SmartScan — Tesseract OCR Wrapper
===================================
Extracts plain text from a dewarped page image using Tesseract OCR.
Used for pages with zero math detections (Path A in the traffic controller).

Usage:
    from tesseract_ocr import extract_text

    text = extract_text("page_001_dewarped.png")
    # → "Chapter 3\nLinear Algebra...\n"
"""

import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import TESSERACT_CMD


def _configure_tesseract():
    """Point pytesseract at the correct binary."""
    try:
        import pytesseract

        if TESSERACT_CMD and os.path.exists(TESSERACT_CMD):
            pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD
        elif os.name == "nt":
            # Common Windows install path
            default_win = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
            if os.path.exists(default_win):
                pytesseract.pytesseract.tesseract_cmd = default_win
        return pytesseract
    except ImportError:
        raise RuntimeError(
            "pytesseract is not installed. Run: pip install pytesseract\n"
            "Also install the Tesseract binary: https://github.com/tesseract-ocr/tesseract"
        )


def extract_text(image_path: str, lang: str = "eng") -> dict:
    """
    Run Tesseract OCR on a single image and return the extracted text.

    Args:
        image_path: Path to the image file.
        lang: Tesseract language code (default: 'eng').

    Returns:
        {
            "text": str,
            "markdown": str,   # same text formatted as Markdown paragraph
            "latency_ms": int,
            "success": bool,
            "error": str | None,
        }
    """
    result = {
        "text": "",
        "markdown": "",
        "latency_ms": 0,
        "success": False,
        "error": None,
    }

    try:
        pytesseract = _configure_tesseract()
        from PIL import Image

        image = Image.open(image_path).convert("RGB")

        # Tesseract config: PSM 6 = assume a single uniform block of text
        custom_config = r"--oem 3 --psm 6"

        t0 = time.monotonic()
        raw_text = pytesseract.image_to_string(image, lang=lang, config=custom_config)
        latency_ms = int((time.monotonic() - t0) * 1000)

        # Clean up extra whitespace while preserving paragraph breaks
        paragraphs = [p.strip() for p in raw_text.split("\n\n") if p.strip()]
        markdown_text = "\n\n".join(paragraphs)

        result.update(
            {
                "text": raw_text,
                "markdown": markdown_text,
                "latency_ms": latency_ms,
                "success": True,
            }
        )
        print(
            f"[Tesseract] {os.path.basename(image_path)}: "
            f"{len(paragraphs)} paragraphs, {latency_ms}ms"
        )

    except Exception as exc:
        result["error"] = str(exc)
        print(f"[Tesseract] ERROR on {image_path}: {exc}")

    return result


def is_available() -> bool:
    """Return True if Tesseract is installed and accessible."""
    try:
        pytesseract = _configure_tesseract()
        version = pytesseract.get_tesseract_version()
        return version is not None
    except Exception:
        return False
