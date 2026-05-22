"""
SmartScan — TrOCR Inference
============================
Loads the fine-tuned TrOCR model from models/trocr-latex/ and runs
inference on cropped math-expression images.

This module is the LOCAL ML proof-of-work shown to faculty.

Usage:
    from trocr_inference import TrOCRRecognizer

    rec = TrOCRRecognizer()          # loads model once
    latex = rec.recognize("expr.jpg")
    # → "\\frac{x^2 + y}{z_n}"
"""

import os
import sys
import time
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import TROCR_MODEL_DIR, MODELS_DIR


class TrOCRRecognizer:
    """
    Singleton-style wrapper around the fine-tuned TrOCR model.
    The model is loaded once on first instantiation and reused.
    """

    _instance = None  # module-level singleton cache

    def __new__(cls):
        if cls._instance is None:
            obj = super().__new__(cls)
            obj._loaded = False
            cls._instance = obj
        return cls._instance

    def _ensure_loaded(self):
        if self._loaded:
            return

        # Determine which model directory to load from
        model_dir = self._resolve_model_dir()

        try:
            from transformers import TrOCRProcessor, VisionEncoderDecoderModel
            import torch

            print(f"[TrOCR] Loading model from: {model_dir}")
            t0 = time.monotonic()

            self.processor = TrOCRProcessor.from_pretrained(model_dir)
            self.model = VisionEncoderDecoderModel.from_pretrained(model_dir)

            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.model = self.model.to(self.device)
            self.model.eval()

            elapsed = time.monotonic() - t0
            print(f"[TrOCR] Model loaded in {elapsed:.1f}s on {self.device}")
            self._loaded = True

        except Exception as exc:
            print(f"[TrOCR] ERROR loading model: {exc}")
            self._loaded = False
            self._load_error = str(exc)
            raise

    def _resolve_model_dir(self) -> str:
        """
        Check fine-tuned model first, fall back to base microsoft model.
        """
        # 1. Fine-tuned weights saved by train_recognizer.py
        if Path(TROCR_MODEL_DIR).exists() and any(Path(TROCR_MODEL_DIR).iterdir()):
            return TROCR_MODEL_DIR

        # 2. Base model from HuggingFace (requires internet on first run)
        print(
            f"[TrOCR] Fine-tuned model not found at {TROCR_MODEL_DIR}. "
            "Falling back to microsoft/trocr-base-printed (downloads on first run)."
        )
        return "microsoft/trocr-base-printed"

    def recognize(self, image_path: str, max_length: int = 256) -> dict:
        """
        Run TrOCR inference on a single cropped math-expression image.

        Args:
            image_path: Path to the cropped formula image.
            max_length: Maximum number of LaTeX tokens to generate.

        Returns:
            {
                "latex": str,
                "latency_ms": int,
                "model_used": str,
                "success": bool,
                "error": str | None,
            }
        """
        result = {
            "latex": "",
            "latency_ms": 0,
            "model_used": str(self._resolve_model_dir()),
            "success": False,
            "error": None,
        }

        try:
            self._ensure_loaded()

            from PIL import Image
            import torch

            image = Image.open(image_path).convert("RGB")
            pixel_values = self.processor(
                images=image, return_tensors="pt"
            ).pixel_values.to(self.device)

            t0 = time.monotonic()
            with torch.no_grad():
                generated_ids = self.model.generate(
                    pixel_values,
                    max_length=max_length,
                    num_beams=4,
                    early_stopping=True,
                )
            latency_ms = int((time.monotonic() - t0) * 1000)

            latex = self.processor.batch_decode(
                generated_ids, skip_special_tokens=True
            )[0].strip()

            result.update(
                {
                    "latex": latex,
                    "latency_ms": latency_ms,
                    "success": True,
                }
            )
            print(f"[TrOCR] {Path(image_path).name}: '{latex[:60]}' ({latency_ms}ms)")

        except Exception as exc:
            result["error"] = str(exc)
            print(f"[TrOCR] ERROR on {image_path}: {exc}")

        return result

    def recognize_batch(self, image_paths: list, max_length: int = 256) -> list:
        """
        Run inference on a list of cropped formula images.
        Returns a list of result dicts in the same order.
        """
        return [self.recognize(p, max_length=max_length) for p in image_paths]

    @property
    def is_available(self) -> bool:
        """Return True if the model loaded successfully."""
        try:
            self._ensure_loaded()
            return self._loaded
        except Exception:
            return False


# Module-level singleton — import and reuse in app.py
_recognizer: TrOCRRecognizer | None = None


def get_recognizer() -> TrOCRRecognizer:
    """Return the module-level singleton TrOCR recognizer."""
    global _recognizer
    if _recognizer is None:
        _recognizer = TrOCRRecognizer()
    return _recognizer
