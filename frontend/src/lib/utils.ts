import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Clean and auto-balance malformed LaTeX produced by TrOCR/OCR models.
 *
 * Handles real-world TrOCR artifacts:
 *  - Spaces inside grouping braces:  { c c }  →  {cc}
 *  - Unclosed \begin{env} → appends \end{env}
 *  - Extra closing braces beyond what was opened → trimmed
 *  - Unmatched \left → appends \right.
 *  - & and \\ outside array/matrix environments → removed
 *  - \right with no matching \left → converted to \right.
 *  - Strips trailing garbage chars that can't be valid LaTeX endings
 */
export function cleanAndBalanceLatex(latex: string): string {
  if (!latex || !latex.trim()) return latex;

  let s = latex.trim();

  // ── 0. Normalise spaces inside {} groups (TrOCR loves { c c } format) ──────
  // e.g.  { c c }  →  {cc},   { l l }  →  {ll},  { r }  →  {r}
  // Only do this for short single-type column-spec groups (array specs)
  s = s.replace(/\{\s+([a-zA-Z\s|]+?)\s+\}/g, (_match, inner) => {
    // Collapse spaces only if all chars are column-spec letters or |
    const stripped = inner.replace(/\s+/g, "");
    if (/^[lcr|]+$/.test(stripped)) return `{${stripped}}`;
    return _match; // leave other {…} groups alone
  });

  // ── 1. Balance \begin{env} / \end{env} ──────────────────────────────────────
  const beginRx = /\\begin\{([^}]+)\}/g;
  const endRx   = /\\end\{([^}]+)\}/g;

  const opens: string[] = [];
  let m: RegExpExecArray | null;
  beginRx.lastIndex = 0;
  while ((m = beginRx.exec(s)) !== null) opens.push(m[1]);

  const closes: string[] = [];
  endRx.lastIndex = 0;
  while ((m = endRx.exec(s)) !== null) closes.push(m[1]);

  // Remove matched pairs
  for (const env of closes) {
    const idx = opens.lastIndexOf(env);
    if (idx !== -1) opens.splice(idx, 1);
  }
  // Append missing \end{env} in reverse open order
  for (let i = opens.length - 1; i >= 0; i--) {
    s += ` \\end{${opens[i]}}`;
  }

  // Is the expression inside any array-like environment?
  const inArrayEnv = /\\begin\{(array|matrix|pmatrix|bmatrix|vmatrix|cases|align|aligned|tabular)\}/.test(s);

  // ── 2. Strip & and \\ that appear OUTSIDE array environments ────────────────
  // TrOCR often emits stray alignment & or line-break \\ in regular math
  if (!inArrayEnv) {
    s = s.replace(/(?<!\\)&/g, "");          // bare &
    s = s.replace(/\\\\(\[.*?\])?/g, " ");   // \\ (with optional [Xpt] spacing)
  }

  // ── 3. Balance \left / \right ────────────────────────────────────────────────
  // Count \left and \right occurrences
  const leftMatches  = s.match(/\\left\s*(?:\(|\[|\{|\||\\lbrace|\\langle|\\lvert|\\lVert|\.)/g) || [];
  const rightMatches = s.match(/\\right\s*(?:\)|\]|\}|\||\\rbrace|\\rangle|\\rvert|\\rVert|\.)/g) || [];
  const leftCount  = leftMatches.length;
  const rightCount = rightMatches.length;
  if (rightCount > leftCount) {
    // More \right than \left — prefix missing \left.
    s = "\\left. ".repeat(rightCount - leftCount) + s;
  } else {
    // More \left than \right — append \right.
    for (let i = rightCount; i < leftCount; i++) s += " \\right.";
  }

  // ── 4. Balance braces { } — first count net depth ────────────────────────────
  let maxDeficit = 0; // extra } seen before any {
  let runningDepth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && i + 1 < s.length) { i++; continue; } // skip escape
    if (s[i] === "{") { runningDepth++; }
    else if (s[i] === "}") {
      runningDepth--;
      if (runningDepth < 0) { maxDeficit++; runningDepth = 0; }
    }
  }
  // If net open braces remain, close them
  if (runningDepth > 0) s += "}".repeat(runningDepth);
  // If extra closing braces were found, prepend matching opens
  if (maxDeficit > 0) s = "{".repeat(maxDeficit) + s;

  // ── 5. Balance [ ] ──────────────────────────────────────────────────────────
  let sqDepth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && i + 1 < s.length) { i++; continue; }
    if (s[i] === "[") sqDepth++;
    else if (s[i] === "]") sqDepth = Math.max(0, sqDepth - 1);
  }
  s += "]".repeat(sqDepth);

  // ── 6. Strip trailing stray non-LaTeX characters ────────────────────────────
  // Remove orphaned & | ; at end of expression
  s = s.replace(/[\s&;|]+$/, "").trim();

  return s;
}
