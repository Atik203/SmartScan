/**
 * SmartScan – Centralised Flask API client
 * All Next.js code imports from here — never hardcodes "localhost:5000".
 */

const FLASK_BASE = process.env.NEXT_PUBLIC_FLASK_URL ?? "http://localhost:5000";

export interface StatusResponse {
  pages_scanned: number;
  formulas_detected: number;
  queue_length: number;
  recent_activity: ActivityItem[];
  uptime_seconds: number;
}

export interface ActivityItem {
  filename: string;
  status: string;
  timestamp: string;
  detections?: number;
  route?: string;
  page_number?: number;
}

export interface HealthResponse {
  arduino: boolean;
  pi: boolean;
  pi_ip: string;
  model_loaded: boolean;
  model_error: string | null;
  tesseract: boolean;
  pandoc: boolean;
  gemini_configured: boolean;
  uptime_seconds: number;
}

export interface UsageResponse {
  provider: string;
  model: string;
  calls: number;
  avgLatencyMs: number;
  lastError: string | null;
  remainingBudgetUsd: number | null;
}

export interface PageMeta {
  number: number;
  filename: string;
  path: string;
  preview: string;
  latex_count: number;
  char_count: number;
}

export interface PageContent {
  number: number;
  markdown: string;
  latex_blocks: string[];
  found: boolean;
}

export interface ProcessResult {
  success: boolean;
  file: string;
  page_number: number;
  original: string | null;
  cropped: string | null;
  dewarped: string | null;
  detected: string | null;
  detections: number;
  boxes: { x1: number; y1: number; x2: number; y2: number; confidence: number }[];
  route: "local" | "ai" | "fallback";
  markdown: string;
  latex_blocks: string[];
  trocr_results: { latex: string; latency_ms: number; success: boolean }[];
  latency_ms: number;
}

export interface GalleryItem {
  name: string;
  original: string | null;
  cropped: string | null;
  dewarped: string | null;
  detected: string | null;
  extracted: string[];
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${FLASK_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Public API ──────────────────────────────────────────────────────────────

export const flaskApi = {
  status: () => get<StatusResponse>("/status"),
  health: () => get<HealthResponse>("/health"),
  usage: () => get<UsageResponse>("/usage"),

  pages: () => get<{ pages: PageMeta[]; total: number }>("/pages"),
  page: (n: number) => get<PageContent>(`/pages/${n}`),

  gallery: (name: string) => get<GalleryItem>(`/gallery/${name}`),

  pdfUrl: () => `${FLASK_BASE}/book/pdf`,
  imageUrl: (rel: string) =>
    rel.startsWith("http") ? rel : `${FLASK_BASE}${rel}`,

  async processPage(file: File, pageNumber: number): Promise<ProcessResult> {
    const form = new FormData();
    form.append("image", file);
    form.append("page_number", String(pageNumber));
    const res = await fetch(`${FLASK_BASE}/process-page`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error(`process-page → ${res.status}`);
    return res.json() as Promise<ProcessResult>;
  },
};
