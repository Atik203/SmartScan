"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Settings, Cpu, HardDrive, Wifi, Terminal,
  CheckCircle2, AlertCircle, RefreshCw, Brain,
  FileText, Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useHealth, useUsage, useStatus } from "@/hooks/use-smartscan";

function StatusRow({
  label, ok, detail,
}: { label: string; ok: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {ok ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
        ) : (
          <AlertCircle className="h-4 w-4 text-zinc-500 shrink-0" />
        )}
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {detail && <span className="text-xs text-muted-foreground font-mono">{detail}</span>}
        <Badge
          variant="secondary"
          className={`text-[10px] ${
            ok
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-zinc-700/40 text-zinc-500"
          }`}
        >
          {ok ? "OK" : "Offline"}
        </Badge>
      </div>
    </div>
  );
}

function formatUptime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export default function SystemPage() {
  const { health, healthLoading } = useHealth();
  const { usage, usageLoading } = useUsage();
  const { status, statusLoading } = useStatus();

  return (
    <AppLayout title="System Settings">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Hardware & Component Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-400" />
                Component Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : !health ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Flask backend not responding — start it with <code className="text-xs bg-muted px-1 py-0.5 rounded">python app.py</code>
                </p>
              ) : (
                <div className="divide-y divide-border/30">
                  <StatusRow
                    label="Arduino Mega 2560"
                    ok={health.arduino}
                    detail="Serial — requires physical connection"
                  />
                  <StatusRow
                    label={`Raspberry Pi 5 (${health.pi_ip})`}
                    ok={health.pi}
                    detail="Network ping"
                  />
                  <StatusRow
                    label="YOLO / Faster R-CNN Model"
                    ok={health.model_loaded}
                    detail={health.model_error ? "Check models/ dir" : "Loaded"}
                  />
                  <StatusRow
                    label="TrOCR Recognizer"
                    ok={health.model_loaded}
                    detail="models/trocr-latex/"
                  />
                  <StatusRow
                    label="Tesseract OCR"
                    ok={health.tesseract}
                    detail="Binary in PATH"
                  />
                  <StatusRow
                    label="Pandoc PDF Engine"
                    ok={health.pandoc}
                    detail="Required for /book/pdf"
                  />
                  <StatusRow
                    label="Gemini API"
                    ok={health.gemini_configured}
                    detail="GEMINI_API_KEY in .env"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Processing Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-400" />
                Processing Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Pages Scanned",
                    value: statusLoading ? "—" : String(status?.pages_scanned ?? 0),
                    icon: FileText,
                    color: "text-blue-400",
                  },
                  {
                    label: "Formulas Detected",
                    value: statusLoading ? "—" : String(status?.formulas_detected ?? 0),
                    icon: Zap,
                    color: "text-purple-400",
                  },
                  {
                    label: "Engine Uptime",
                    value: statusLoading ? "—" : formatUptime(status?.uptime_seconds ?? 0),
                    icon: RefreshCw,
                    color: "text-emerald-400",
                  },
                  {
                    label: "API Calls",
                    value: usageLoading ? "—" : String(usage?.calls ?? 0),
                    icon: Wifi,
                    color: "text-amber-400",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border border-border/30"
                  >
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <p className="text-2xl font-bold mt-1">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* AI Usage detail */}
              {usage && (
                <div className="mt-4 pt-4 border-t border-border/30 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span>
                    Model:{" "}
                    <span className="text-foreground font-mono">{usage.model || "—"}</span>
                  </span>
                  <span>
                    Avg latency:{" "}
                    <span className="text-foreground">{usage.avgLatencyMs}ms</span>
                  </span>
                  {usage.lastError && (
                    <span className="text-red-400">Last error: {usage.lastError.slice(0, 80)}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Processing Log */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-zinc-950 border border-border/30 p-4 font-mono text-xs text-emerald-400 min-h-[220px] overflow-auto max-h-[380px] space-y-1">
                <p className="text-zinc-500">&gt; SmartScan Processing Engine v2.0</p>
                <p className="text-zinc-500">&gt; Flask backend — http://localhost:5000</p>
                <p className="text-zinc-500">&gt; YOLO + TrOCR + Gemini routing active</p>
                <Separator className="my-2 bg-zinc-800" />
                {statusLoading ? (
                  <p className="text-zinc-600 animate-pulse">&gt; Loading activity...</p>
                ) : !status?.recent_activity?.length ? (
                  <p className="text-zinc-600">&gt; No activity yet. Process images to begin.</p>
                ) : (
                  status.recent_activity.map((item, i) => (
                    <p key={i} className={
                      item.status === "processed" ? "text-emerald-400" :
                      item.status === "error" ? "text-red-400" : "text-amber-400"
                    }>
                      &gt; [{item.timestamp}] {item.filename} — {item.status}
                      {item.detections !== undefined && ` (${item.detections} math)`}
                      {item.route && ` [${item.route}]`}
                    </p>
                  ))
                )}
                <p className="text-zinc-500 animate-pulse mt-2">█</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Connection Reference */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4 text-zinc-400" />
                Quick Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
                  { label: "Flask Backend", value: "http://localhost:5000" },
                  { label: "Next.js Frontend", value: "http://localhost:3000" },
                  { label: "Pi IP (config.py)", value: health?.pi_ip ?? "192.168.1.100" },
                  { label: "Models Directory", value: "E:\\PROJECT\\SmartScan\\models\\" },
                  { label: "Captures Directory", value: "E:\\PROJECT\\SmartScan\\SmartScan_Captures\\" },
                  { label: "Output PDF", value: "E:\\PROJECT\\SmartScan\\output\\pdf\\Final_Book.pdf" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-0.5 p-2 rounded-lg bg-muted/20 border border-border/20">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wide">{item.label}</span>
                    <code className="text-foreground text-[11px] font-mono break-all">{item.value}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
