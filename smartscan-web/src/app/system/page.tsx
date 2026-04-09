"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Cpu,
  HardDrive,
  Wifi,
  Terminal,
  Save,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";

export default function SystemPage() {
  return (
    <AppLayout title="System Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hardware Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-400" />
                Hardware Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    name: "GPU",
                    value: "RTX 3060 6GB",
                    status: "Available",
                    ok: true,
                  },
                  {
                    name: "CUDA",
                    value: "12.1",
                    status: "Installed",
                    ok: true,
                  },
                  {
                    name: "PyTorch",
                    value: "2.x",
                    status: "Ready",
                    ok: true,
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
                  >
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.value}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        item.ok
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Connection Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Wifi className="h-4 w-4 text-purple-400" />
                Connection Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Raspberry Pi IP</Label>
                  <Input
                    defaultValue="192.168.1.100"
                    className="bg-muted/30 border-border/50 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Pi Username</Label>
                  <Input
                    defaultValue="pi"
                    className="bg-muted/30 border-border/50 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Serial Port</Label>
                  <Input
                    defaultValue="/dev/ttyUSB0"
                    className="bg-muted/30 border-border/50 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Baud Rate</Label>
                  <Input
                    defaultValue="9600"
                    className="bg-muted/30 border-border/50 font-mono text-sm"
                  />
                </div>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button size="sm" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Settings
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Processing Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                Processing Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-zinc-950 border border-border/30 p-4 font-mono text-xs text-emerald-400 min-h-[200px] overflow-auto">
                <p className="text-zinc-600">
                  {">"} SmartScan Processing Engine v1.0
                </p>
                <p className="text-zinc-600">
                  {">"} Project Root: E:\PROJECT\SmartScan
                </p>
                <p className="text-zinc-600">
                  {">"} Waiting for processing tasks...
                </p>
                <p className="text-zinc-500 mt-2 animate-pulse">█</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
