"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHealth, useStatus } from "@/hooks/use-smartscan";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Cpu,
  Sigma,
  Zap,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function formatUptime(s: number) {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

export default function DashboardPage() {
  const { status, statusLoading } = useStatus();
  const { health, healthLoading } = useHealth();

  const stats = [
    {
      title: "Pages Scanned",
      value: statusLoading ? "—" : String(status?.pages_scanned ?? 0),
      change: status ? `${status.queue_length} in queue` : "Ready",
      icon: BookOpen,
      gradient: "from-blue-500 to-cyan-400",
      shadow: "shadow-blue-500/20",
    },
    {
      title: "Formulas Detected",
      value: statusLoading ? "—" : String(status?.formulas_detected ?? 0),
      change: "Via YOLO model",
      icon: Sigma,
      gradient: "from-purple-500 to-pink-400",
      shadow: "shadow-purple-500/20",
    },
    {
      title: "Engine Uptime",
      value: statusLoading ? "—" : formatUptime(status?.uptime_seconds ?? 0),
      change: "Flask backend",
      icon: Zap,
      gradient: "from-amber-500 to-orange-400",
      shadow: "shadow-amber-500/20",
    },
    {
      title: "Scanner Status",
      value: healthLoading ? "—" : health?.model_loaded ? "Ready" : "Offline",
      change: health?.pi ? `Pi ${health.pi_ip}` : "Pi disconnected",
      icon: Cpu,
      gradient: "from-emerald-500 to-green-400",
      shadow: "shadow-emerald-500/20",
    },
  ];

  const pipelineLayers = [
    {
      name: "Arduino Uno",
      status: health?.arduino ? "online" : "offline",
      role: "Muscle — servo + fan control",
    },
    {
      name: "Raspberry Pi 5",
      status: health?.pi ? "online" : "offline",
      role: `Bridge — ADB capture (${health?.pi_ip ?? "—"})`,
    },
    {
      name: "Processing Engine",
      status: health?.model_loaded ? "online" : "offline",
      role: `Brain — YOLO + TrOCR${health?.gemini_configured ? " + Gemini" : ""}`,
    },
  ];

  return (
    <AppLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Card className="relative overflow-hidden border-border/50 hover:border-border transition-colors group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {stat.title}
                    </p>
                    {statusLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold mt-1 tracking-tight">
                        {stat.value}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white ${stat.shadow} shadow-lg`}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
              />
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Health */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4, duration: 0.4 }}
          className="lg:col-span-1"
        >
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-400" />
                Pipeline Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pipelineLayers.map((layer, i) => (
                <div key={layer.name} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        layer.status === "online"
                          ? "bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse"
                          : "bg-zinc-600"
                      }`}
                    />
                    {i < pipelineLayers.length - 1 && (
                      <div className="w-px h-6 bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{layer.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {layer.role}
                    </p>
                  </div>
                  <Badge
                    variant={
                      layer.status === "online" ? "default" : "secondary"
                    }
                    className={`text-[10px] ${
                      layer.status === "online"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : ""
                    }`}
                  >
                    {layer.status}
                  </Badge>
                </div>
              ))}

              {/* Extra health flags */}
              {health && (
                <div className="pt-2 border-t border-border/30 space-y-1.5">
                  {[
                    { label: "YOLO Model", ok: health.model_loaded },
                    { label: "Tesseract OCR", ok: health.tesseract },
                    { label: "Pandoc PDF", ok: health.pandoc },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-muted-foreground">
                        {item.label}
                      </span>
                      {item.ok ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-zinc-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.5, duration: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : !status?.recent_activity?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mb-3 text-muted-foreground/30" />
                  <p className="text-sm font-medium">No activity yet</p>
                  <p className="text-xs mt-1">
                    Upload images in the Batch Processor to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {status.recent_activity.map((item, i) => (
                    <motion.div
                      key={`${item.filename}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30"
                    >
                      <div
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          item.status === "processed"
                            ? "bg-emerald-500"
                            : item.status === "processing"
                              ? "bg-amber-500 animate-pulse"
                              : "bg-red-500"
                        }`}
                      />
                      <p className="text-xs font-mono flex-1 truncate">
                        {item.filename}
                      </p>
                      {item.detections !== undefined && (
                        <span className="text-[10px] text-purple-400 shrink-0">
                          {item.detections} formula
                          {item.detections !== 1 ? "s" : ""}
                        </span>
                      )}
                      <Badge
                        variant="secondary"
                        className="text-[10px] shrink-0 capitalize"
                      >
                        {item.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Architecture Overview */}
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mt-6"
      >
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              System Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  layer: "① Muscle",
                  name: "Arduino Uno",
                  desc: "PWM servos, relay control, serial CAPTURE signal",
                  color: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
                  accent: "text-blue-400",
                },
                {
                  layer: "② Bridge",
                  name: "Raspberry Pi 5",
                  desc: "ADB camera trigger, image pull, serial listener",
                  color:
                    "from-purple-500/10 to-purple-500/5 border-purple-500/20",
                  accent: "text-purple-400",
                },
                {
                  layer: "③ Brain",
                  name: "Processing Engine",
                  desc: "YOLO detect → TrOCR recognize → LaTeX → PDF",
                  color:
                    "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
                  accent: "text-emerald-400",
                },
              ].map((item) => (
                <div
                  key={item.layer}
                  className={`rounded-xl border bg-gradient-to-b p-4 ${item.color}`}
                >
                  <p
                    className={`text-[10px] font-bold uppercase tracking-widest ${item.accent}`}
                  >
                    {item.layer}
                  </p>
                  <p className="text-sm font-semibold mt-1">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
