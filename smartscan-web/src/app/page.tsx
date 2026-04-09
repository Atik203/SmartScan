"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Sigma,
  Cpu,
  Zap,
  ArrowUpRight,
  Activity,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  {
    title: "Pages Scanned",
    value: "0",
    change: "Ready",
    icon: BookOpen,
    gradient: "from-blue-500 to-cyan-400",
    shadow: "shadow-blue-500/20",
  },
  {
    title: "Formulas Detected",
    value: "0",
    change: "Ready",
    icon: Sigma,
    gradient: "from-purple-500 to-pink-400",
    shadow: "shadow-purple-500/20",
  },
  {
    title: "Avg. Latency",
    value: "—",
    change: "No data",
    icon: Zap,
    gradient: "from-amber-500 to-orange-400",
    shadow: "shadow-amber-500/20",
  },
  {
    title: "Scanner Status",
    value: "Offline",
    change: "Connect Pi",
    icon: Cpu,
    gradient: "from-emerald-500 to-green-400",
    shadow: "shadow-emerald-500/20",
  },
];

const pipelineLayers = [
  { name: "Arduino Mega", status: "offline", role: "Muscle" },
  { name: "Raspberry Pi 5", status: "offline", role: "Bridge" },
  { name: "Processing Engine", status: "online", role: "Brain" },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
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
                    <p className="text-3xl font-bold mt-1 tracking-tight">
                      {stat.value}
                    </p>
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
                    variant={layer.status === "online" ? "default" : "secondary"}
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
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-3 text-muted-foreground/30" />
                <p className="text-sm font-medium">No activity yet</p>
                <p className="text-xs mt-1">
                  Upload images in the Batch Processor to get started
                </p>
              </div>
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
                  name: "Arduino Mega 2560",
                  desc: "PWM servos, relay control, serial communication",
                  color: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
                  accent: "text-blue-400",
                },
                {
                  layer: "② Bridge",
                  name: "Raspberry Pi 5",
                  desc: "ADB camera trigger, image pull, serial listener",
                  color: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
                  accent: "text-purple-400",
                },
                {
                  layer: "③ Brain",
                  name: "Processing Engine",
                  desc: "Faster R-CNN detection, TrOCR → LaTeX, Flask API",
                  color: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
                  accent: "text-emerald-400",
                },
              ].map((item) => (
                <div
                  key={item.layer}
                  className={`rounded-xl border bg-gradient-to-b p-4 ${item.color}`}
                >
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${item.accent}`}>
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
