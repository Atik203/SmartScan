"""
SmartScan — Gemini API Router
==============================
Sends a full dewarped page image to gemini-2.5-flash-lite and returns
structured Markdown with LaTeX blocks ($$...$$).

This module is intentionally kept INTERNAL. The frontend dashboard
never exposes the fact that Gemini was used — it shows only the
detection and LaTeX results from the local ML models.

Usage:
    from gemini_router import gemini_process_page, usage_stats
"""

import base64
import os
import time
from pathlib import Path

# usage_stats is mutated in-place so app.py can read it at any time
usage_stats = {
    "provider": "gemini",
    "model": "",
    "calls": 0,
    "total_latency_ms": 0,
    "last_error": None,
}

_client = None  # lazy-initialised on first call


def _get_client():
    """Initialise the Gemini client once and reuse it."""
    global _client
    if _client is not None:
        return _client

    try:
        import google.generativeai as genai  # type: ignore
    except ImportError:
        raise RuntimeError(
            "google-generativeai is not installed. "
            "Run: pip install google-generativeai"
        )

    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY environment variable is not set. "
            "Add it to backend/.env"
        )

    genai.configure(api_key=api_key)
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
    _client = genai.GenerativeModel(model_name)
    usage_stats["model"] = model_name
    return _client


_SYSTEM_PROMPT = """You are an expert academic document digitizer.
The image provided is a scanned page from an academic textbook.

Your task:
1. Extract ALL text from the page, preserving the exact textbook formatting, structure, and spacing.
2. Maintain headings and subheadings exactly as written in the textbook, using appropriate Markdown header levels (e.g., `# Chapter 1`, `## 1.1 Algorithms`, `### Input:`).
3. Preserve textbook bolding (e.g., `**insertion sort**`), italics, lists, and enumerations.
4. Keep the exact logical paragraph breaks and insert a blank line (`\n\n`) between paragraphs/sections/lists to ensure proper spacing.
5. Identify every mathematical expression (inline and block).
6. Convert every mathematical expression to valid LaTeX syntax.
   - Inline math → wrap with $...$
   - Block / display math → wrap with $$...$$
7. Preserve logical reading order (text, then formulas in context).
8. Do NOT include running page headers, footers, or page numbers (unless they are part of the main text).
9. Do NOT add any conversational explanation or wrappers — only output the Markdown content.

Example output format:
## 1.1 The Selection Problem

We are given a set of $n$ numbers and want to find the $k$-th smallest element. A simple algorithm is:

1. Read the $n$ numbers into an array.
2. Sort the array in decreasing order using **Insertion Sort**.
3. Return the element at position $k$.

$$T(n) = O(n^2)$$

where $n$ represents the input size.
"""


def gemini_process_page(image_path: str, page_number: int = 0) -> dict:
    """
    Send a page image to Gemini and receive structured Markdown.

    Args:
        image_path: Absolute path to the dewarped page image.
        page_number: Page index (used for logging only).

    Returns:
        {
            "success": bool,
            "markdown": str,       # Full page content as Markdown+LaTeX
            "latex_blocks": list,  # Extracted $$...$$ blocks
            "latency_ms": int,
            "model": str,
            "error": str | None,
        }
    """
    result = {
        "success": False,
        "markdown": "",
        "latex_blocks": [],
        "latency_ms": 0,
        "model": usage_stats["model"],
        "error": None,
    }

    try:
        client = _get_client()
        result["model"] = usage_stats["model"]

        # Read and encode image
        image_data = Path(image_path).read_bytes()
        b64_image = base64.b64encode(image_data).decode("utf-8")

        # Determine MIME type
        suffix = Path(image_path).suffix.lower()
        mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}
        mime_type = mime_map.get(suffix, "image/jpeg")

        # Build request
        contents = [
            _SYSTEM_PROMPT,
            {"mime_type": mime_type, "data": b64_image},
        ]

        # Call API and time it
        t0 = time.monotonic()
        response = client.generate_content(contents)
        latency_ms = int((time.monotonic() - t0) * 1000)

        markdown_text = response.text.strip()

        # Extract LaTeX display blocks for the frontend LaTeX preview
        latex_blocks = _extract_latex_blocks(markdown_text)

        # Update usage stats
        usage_stats["calls"] += 1
        usage_stats["total_latency_ms"] += latency_ms

        result.update(
            {
                "success": True,
                "markdown": markdown_text,
                "latex_blocks": latex_blocks,
                "latency_ms": latency_ms,
                "error": None,
            }
        )
        print(
            f"[Gemini] Page {page_number}: {len(latex_blocks)} LaTeX blocks extracted "
            f"in {latency_ms}ms"
        )

    except Exception as exc:
        error_msg = str(exc)
        usage_stats["last_error"] = error_msg
        result["error"] = error_msg
        print(f"[Gemini] ERROR on page {page_number}: {error_msg}")

    return result


def _extract_latex_blocks(markdown: str) -> list:
    """
    Parse display-math blocks ($$...$$) from a Markdown string.
    Returns a list of LaTeX strings (without the $$ delimiters).
    """
    blocks = []
    parts = markdown.split("$$")
    # Every odd-indexed part (1, 3, 5…) is inside $$...$$
    for i, part in enumerate(parts):
        if i % 2 == 1 and part.strip():
            blocks.append(part.strip())
    return blocks


def get_usage_summary() -> dict:
    """Return a JSON-serialisable usage summary for the /usage endpoint."""
    calls = usage_stats["calls"]
    avg_latency = int(usage_stats["total_latency_ms"] / calls) if calls > 0 else 0
    return {
        "provider": usage_stats["provider"],
        "model": usage_stats["model"],
        "calls": calls,
        "avgLatencyMs": avg_latency,
        "lastError": usage_stats["last_error"],
        "remainingBudgetUsd": None,  # Gemini does not expose quota via SDK yet
    }
