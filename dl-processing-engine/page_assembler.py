"""
SmartScan — Page Assembler & PDF Compiler
==========================================
Merges all page_NNN.md files into a single book and compiles to PDF
using Pandoc + XeLaTeX.

Usage:
    from page_assembler import assemble_book, compile_pdf, list_pages

    pages = list_pages()           # → [{"number":1, "path":"...", "preview":"..."}]
    merged_path = assemble_book()  # → "output/merged_book.md"
    pdf_path    = compile_pdf()    # → "output/Final_Book.pdf"
"""

import os
import re
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import (
    MARKDOWN_OUTPUT_DIR,
    PDF_OUTPUT_PATH,
    PDF_OUTPUT_DIR,
    PDF_ENGINE,
    ensure_dirs,
)

ensure_dirs()


# ─── Page listing ────────────────────────────────────────────────────────────


def list_pages() -> list:
    """
    Return metadata for every page_NNN.md in MARKDOWN_OUTPUT_DIR.

    Returns:
        List of dicts sorted by page number:
        [
          {
            "number": 1,
            "filename": "page_001.md",
            "path": "/abs/path/page_001.md",
            "preview": "First 200 chars of content…",
            "latex_count": 3,
            "char_count": 1234,
          },
          ...
        ]
    """
    folder = Path(MARKDOWN_OUTPUT_DIR)
    if not folder.exists():
        return []

    pages = []
    pattern = re.compile(r"^page_(\d+)\.md$")

    for md_file in sorted(folder.iterdir()):
        match = pattern.match(md_file.name)
        if not match:
            continue

        page_num = int(match.group(1))
        content = md_file.read_text(encoding="utf-8", errors="replace")

        source_file = _extract_source_file(content)

        # Strip HTML comment header for preview
        preview_text = re.sub(r"<!--.*?-->\s*", "", content, flags=re.DOTALL).strip()
        preview = preview_text[:200] + ("…" if len(preview_text) > 200 else "")

        # Count LaTeX display blocks
        latex_count = content.count("$$") // 2

        pages.append(
            {
                "number": page_num,
                "filename": md_file.name,
                "path": str(md_file.resolve()),
                "preview": preview,
                "latex_count": latex_count,
                "char_count": len(content),
                "source_file": source_file,
            }
        )

    pages.sort(key=lambda p: p["number"])
    return pages


def get_page_content(page_number: int) -> dict:
    """
    Read the full markdown content of a single page.

    Returns:
        {
            "number": int,
            "markdown": str,
            "latex_blocks": list[str],
            "found": bool,
        }
    """
    filename = f"page_{page_number:03d}.md"
    path = Path(MARKDOWN_OUTPUT_DIR) / filename

    if not path.exists():
        return {
            "number": page_number,
            "markdown": "",
            "latex_blocks": [],
            "found": False,
        }

    content = path.read_text(encoding="utf-8", errors="replace")
    latex_blocks = _extract_display_math(content)
    source_file = _extract_source_file(content)

    return {
        "number": page_number,
        "markdown": content,
        "latex_blocks": latex_blocks,
        "source_file": source_file,
        "found": True,
    }


# ─── Book assembly ───────────────────────────────────────────────────────────


def assemble_book() -> str:
    """
    Merge all page_NNN.md files into a single merged_book.md,
    separated by LaTeX \\newpage commands.

    Returns:
        Absolute path to the merged file.
    """
    pages = list_pages()
    if not pages:
        raise RuntimeError(
            f"No page_NNN.md files found in {MARKDOWN_OUTPUT_DIR}. "
            "Process some pages first."
        )

    os.makedirs(PDF_OUTPUT_DIR, exist_ok=True)
    merged_path = os.path.join(PDF_OUTPUT_DIR, "merged_book.md")

    with open(merged_path, "w", encoding="utf-8") as out:
        out.write("---\n")
        out.write("title: 'SmartScan Digitized Book'\n")
        out.write("geometry: 'margin=2.5cm'\n")
        out.write("fontsize: '11pt'\n")
        out.write("mainfont: 'DejaVu Serif'\n")
        out.write("---\n\n")

        for i, page in enumerate(pages):
            content = Path(page["path"]).read_text(encoding="utf-8", errors="replace")
            # Remove the HTML comment header we write in traffic_controller
            content = re.sub(r"<!--.*?-->\n\n", "", content, flags=re.DOTALL)
            out.write(content)
            if i < len(pages) - 1:
                out.write("\n\n\\newpage\n\n")

    print(f"[Assembler] Merged {len(pages)} pages → {merged_path}")
    return merged_path


# ─── PDF compilation ─────────────────────────────────────────────────────────


def compile_pdf(force: bool = False) -> dict:
    """
    Compile the merged_book.md to PDF using Pandoc + XeLaTeX.

    Args:
        force: If True, recompile even if an up-to-date PDF exists.

    Returns:
        {
            "success": bool,
            "pdf_path": str,
            "page_count": int,
            "latency_ms": int,
            "error": str | None,
        }
    """
    result = {
        "success": False,
        "pdf_path": PDF_OUTPUT_PATH,
        "page_count": len(list_pages()),
        "latency_ms": 0,
        "error": None,
    }

    # Skip recompile if fresh PDF exists and no new pages
    if not force and _pdf_is_fresh():
        result["success"] = True
        print("[Assembler] PDF is up to date, skipping recompile.")
        return result

    if not _pandoc_available():
        result["error"] = (
            "Pandoc is not installed or not in PATH. "
            "Install from https://pandoc.org/installing.html"
        )
        print(f"[Assembler] ERROR: {result['error']}")
        return result

    if not _pdf_engine_available(PDF_ENGINE):
        result["error"] = (
            f"PDF engine '{PDF_ENGINE}' not found in PATH. "
            "Install a TeX distribution (e.g., MiKTeX/TeX Live) or set PDF_ENGINE."
        )
        print(f"[Assembler] ERROR: {result['error']}")
        return result

    try:
        t0 = time.monotonic()
        merged_path = assemble_book()

        os.makedirs(PDF_OUTPUT_DIR, exist_ok=True)

        cmd = [
            "pandoc",
            merged_path,
            f"--pdf-engine={PDF_ENGINE}",
            "--output",
            PDF_OUTPUT_PATH,
            "--standalone",
            "--highlight-style=tango",
            "-V",
            "colorlinks=true",
            "-V",
            "linkcolor=blue",
        ]

        print(f"[Assembler] Running: {' '.join(cmd)}")
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,  # 5-minute timeout
        )

        if proc.returncode != 0:
            result["error"] = proc.stderr or proc.stdout or "Pandoc failed"
            print(f"[Assembler] Pandoc FAILED:\n{result['error']}")
            return result

        latency_ms = int((time.monotonic() - t0) * 1000)
        result.update(
            {
                "success": True,
                "latency_ms": latency_ms,
            }
        )
        print(f"[Assembler] PDF compiled in {latency_ms}ms → {PDF_OUTPUT_PATH}")

    except subprocess.TimeoutExpired:
        result["error"] = "Pandoc timed out after 5 minutes"
    except Exception as exc:
        result["error"] = str(exc)
        print(f"[Assembler] ERROR: {exc}")

    return result


# ─── Helpers ─────────────────────────────────────────────────────────────────


def _extract_display_math(markdown: str) -> list:
    parts = markdown.split("$$")
    return [p.strip() for i, p in enumerate(parts) if i % 2 == 1 and p.strip()]


def _extract_source_file(markdown: str) -> str | None:
    match = re.search(
        r"<!--\s*Page\s+\d+(?:\s*\|\s*Source:\s*(.+?))?\s*-->",
        markdown,
    )
    if not match:
        return None
    source = match.group(1)
    return source.strip() if source else None


def _pandoc_available() -> bool:
    try:
        r = subprocess.run(
            ["pandoc", "--version"],
            capture_output=True,
            timeout=10,
        )
        return r.returncode == 0
    except Exception:
        return False


def _pdf_engine_available(engine: str) -> bool:
    try:
        r = subprocess.run([engine, "--version"], capture_output=True, timeout=10)
        return r.returncode == 0
    except Exception:
        return False


def _pdf_is_fresh() -> bool:
    pdf = Path(PDF_OUTPUT_PATH)
    if not pdf.exists():
        return False
    pdf_mtime = pdf.stat().st_mtime
    pages = list_pages()
    if not pages:
        return False
    latest_md = max(Path(p["path"]).stat().st_mtime for p in pages)
    return pdf_mtime >= latest_md
