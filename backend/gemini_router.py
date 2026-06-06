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
import requests
from pathlib import Path
from config import (
    API_PROVIDER,
    GEMINI_API_KEY,
    GEMINI_MODEL,
    OPENAI_API_KEY,
    OPENAI_MODEL,
)

# usage_stats is mutated in-place so app.py can read it at any time
usage_stats = {
    "provider": API_PROVIDER,
    "model": OPENAI_MODEL if API_PROVIDER == "openai" else GEMINI_MODEL,
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
        from google import genai  # type: ignore
    except ImportError:
        raise RuntimeError(
            "google-genai is not installed. "
            "Run: pip install google-genai"
        )

    if not GEMINI_API_KEY:
        raise RuntimeError(
            "GEMINI_API_KEY environment variable is not set. "
            "Add it to backend/.env"
        )

    _client = genai.Client(api_key=GEMINI_API_KEY)
    usage_stats["model"] = GEMINI_MODEL
    return _client


_SYSTEM_PROMPT = """You are an expert academic document digitizer.
The image provided is a scanned page or a 2-page book spread (left and right pages side-by-side) from an academic textbook.

Your task:
1. Extract ALL text from the page/spread, preserving the exact textbook formatting, structure, and spacing.
2. If the image is a 2-page spread, you MUST process the pages in logical reading order: first read and extract the entire left page completely from top to bottom, then read and extract the entire right page completely from top to bottom. Do NOT mix text, columns, or lines across the middle border of the left and right pages.
3. Maintain headings and subheadings exactly as written in the textbook, using appropriate Markdown header levels (e.g., `# Chapter 1`, `## 1.1 Algorithms`, `### Input:`).
4. Preserve textbook bolding (e.g., `**insertion sort**`), italics, lists, and enumerations.
5. Keep the exact logical paragraph breaks and insert a blank line (`\n\n`) between paragraphs/sections/lists to ensure proper spacing.
6. Identify every mathematical expression (inline and block).
7. Convert every mathematical expression to valid LaTeX syntax.
   - Inline math → wrap with $...$
   - Block / display math → wrap with $$...$$
8. Preserve logical reading order (text, then formulas in context).
9. Do NOT include running page headers, footers, or page numbers (unless they are part of the main text).
10. Do NOT add any conversational explanation or wrappers — only output the Markdown content.

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
    Process a page image using the active LLM provider (OpenAI or Gemini)
    and receive structured Markdown.

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
    if API_PROVIDER == "openai":
        return _run_openai_path(image_path, page_number)
    else:
        return _run_gemini_path(image_path, page_number)


def _run_openai_path(image_path: str, page_number: int) -> dict:
    """Path B primary — call OpenAI Chat Completions API with image input."""
    result = {
        "success": False,
        "markdown": "",
        "latex_blocks": [],
        "latency_ms": 0,
        "model": OPENAI_MODEL,
        "error": None,
    }

    try:
        if not OPENAI_API_KEY:
            raise RuntimeError(
                "OPENAI_API_KEY environment variable is not set. "
                "Add it to backend/.env"
            )

        # Read and encode image to base64
        image_data = Path(image_path).read_bytes()
        suffix = Path(image_path).suffix.lower()
        mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}
        mime_type = mime_map.get(suffix, "image/jpeg")
        base64_image = base64.b64encode(image_data).decode("utf-8")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}",
        }

        payload = {
            "model": OPENAI_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": _SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            "temperature": 0.1,
        }

        t0 = time.monotonic()
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60,
        )
        latency_ms = int((time.monotonic() - t0) * 1000)

        if response.status_code != 200:
            raise RuntimeError(
                f"OpenAI API returned status code {response.status_code}: {response.text}"
            )

        res_json = response.json()
        markdown_text = res_json["choices"][0]["message"]["content"].strip()

        # Clean markdown code block wrapper if returned by LLM
        if markdown_text.startswith("```"):
            lines = markdown_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            markdown_text = "\n".join(lines).strip()

        latex_blocks = _extract_latex_blocks(markdown_text)

        # Update stats
        usage_stats["calls"] += 1
        usage_stats["total_latency_ms"] += latency_ms
        usage_stats["provider"] = "openai"
        usage_stats["model"] = OPENAI_MODEL

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
            f"[OpenAI] Page {page_number}: {len(latex_blocks)} LaTeX blocks extracted "
            f"in {latency_ms}ms using {OPENAI_MODEL}"
        )

    except Exception as exc:
        error_msg = str(exc)
        usage_stats["last_error"] = error_msg
        result["error"] = error_msg
        print(f"[OpenAI] ERROR on page {page_number}: {error_msg}")

    return result


def _run_gemini_path(image_path: str, page_number: int) -> dict:
    """Path B fallback/secondary — call Gemini API."""
    result = {
        "success": False,
        "markdown": "",
        "latex_blocks": [],
        "latency_ms": 0,
        "model": GEMINI_MODEL,
        "error": None,
    }

    try:
        client = _get_client()

        # Read and encode image
        image_data = Path(image_path).read_bytes()
        suffix = Path(image_path).suffix.lower()
        mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}
        mime_type = mime_map.get(suffix, "image/jpeg")

        from google.genai import types

        contents = [
            types.Part.from_bytes(data=image_data, mime_type=mime_type),
        ]

        t0 = time.monotonic()
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT
            ),
        )
        latency_ms = int((time.monotonic() - t0) * 1000)

        markdown_text = response.text.strip()
        latex_blocks = _extract_latex_blocks(markdown_text)

        # Update stats
        usage_stats["calls"] += 1
        usage_stats["total_latency_ms"] += latency_ms
        usage_stats["provider"] = "gemini"
        usage_stats["model"] = GEMINI_MODEL

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
