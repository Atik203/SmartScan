import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Auto-balance malformed LaTeX produced by TrOCR/OCR models.
 * Closes unclosed \begin{env} environments, braces, brackets,
 * parentheses, and \left delimiters so KaTeX can render them
 * without throwing an error.
 */
export function cleanAndBalanceLatex(latex: string): string {
  if (!latex || !latex.trim()) return latex;

  let s = latex.trim();

  // ── 1. Balance \begin{env} / \end{env} ─────────────────────────────────
  const beginRx = /\\begin\{([^}]+)\}/g;
  const endRx   = /\\end\{([^}]+)\}/g;

  const opens: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = beginRx.exec(s)) !== null) opens.push(m[1]);

  const closes: string[] = [];
  while ((m = endRx.exec(s)) !== null) closes.push(m[1]);

  // Remove matched pairs from the tail of opens
  for (const env of closes) {
    const idx = opens.lastIndexOf(env);
    if (idx !== -1) opens.splice(idx, 1);
  }

  // Append missing \end{env} in reverse order
  for (let i = opens.length - 1; i >= 0; i--) {
    s += ` \\end{${opens[i]}}`;
  }

  // ── 2. Balance \left / \right ───────────────────────────────────────────
  const leftCount  = (s.match(/\\left(?:\(|\[|\{|\||\\lbrace|\\langle|\\lvert|\\lVert|\.)/g) || []).length;
  const rightCount = (s.match(/\\right(?:\)|\]|\}|\||\\rbrace|\\rangle|\\rvert|\\rVert|\.)/g) || []).length;
  for (let i = rightCount; i < leftCount; i++) s += " \\right.";

  // ── 3. Balance braces { } ───────────────────────────────────────────────
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && i + 1 < s.length) { i++; continue; } // skip escaped
    if (s[i] === "{") depth++;
    else if (s[i] === "}") depth = Math.max(0, depth - 1);
  }
  s += "}".repeat(depth);

  // ── 4. Balance [ ] (non-escaped only) ──────────────────────────────────
  let sqDepth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && i + 1 < s.length) { i++; continue; }
    if (s[i] === "[") sqDepth++;
    else if (s[i] === "]") sqDepth = Math.max(0, sqDepth - 1);
  }
  s += "]".repeat(sqDepth);

  return s;
}
