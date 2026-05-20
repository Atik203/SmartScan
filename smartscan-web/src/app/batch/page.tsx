"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePages } from "@/hooks/use-smartscan";
import { flaskApi, ProcessResult } from "@/lib/flask-api";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  BookOpenText,
  CheckCircle2,
  FileImage,
  FolderOpen,
  Loader2,
  Play,
  Sigma,
  Upload,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: "queued" | "processing" | "done" | "error";
  progress: number;
  result?: ProcessResult;
  error?: string;
}

interface CaptureSummary {
  total: number;
  errors: number;
  message?: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BatchPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [capturesRunning, setCapturesRunning] = useState(false);
  const [capturesSummary, setCapturesSummary] = useState<CaptureSummary | null>(
    null,
  );
  const stopRef = useRef(false);
  const { total } = usePages();

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const arr = Array.from(fileList);
    const newItems: UploadedFile[] = arr
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        file: f,
        name: f.name,
        size: f.size,
        status: "queued" as const,
        progress: 0,
      }));
    setFiles((prev) => [...prev, ...newItems]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const startProcessing = async () => {
    stopRef.current = false;
    setIsRunning(true);
    const queued = files.filter((f) => f.status === "queued");

    for (let i = 0; i < queued.length; i++) {
      if (stopRef.current) break;
      const item = queued[i];

      // mark processing
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: "processing", progress: 20 } : f,
        ),
      );

      try {
        // Fake progress ticks while waiting
        const ticker = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id && f.status === "processing"
                ? { ...f, progress: Math.min(f.progress + 15, 85) }
                : f,
            ),
          );
        }, 600);

        const result = await flaskApi.processPage(item.file, total + i + 1);
        clearInterval(ticker);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: "done", progress: 100, result }
              : f,
          ),
        );
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: "error", progress: 0, error: String(err) }
              : f,
          ),
        );
      }
    }
    setIsRunning(false);
  };

  const runCaptures = async () => {
    setCapturesRunning(true);
    setCapturesSummary(null);
    try {
      const res = await flaskApi.processCaptures();
      setCapturesSummary({ total: res.total, errors: res.errors.length });
    } catch (err) {
      setCapturesSummary({ total: 0, errors: 1, message: String(err) });
    } finally {
      setCapturesRunning(false);
    }
  };

  const clearDone = () =>
    setFiles((prev) => prev.filter((f) => f.status !== "done"));

  const queued = files.filter((f) => f.status === "queued").length;
  const done = files.filter((f) => f.status === "done").length;

  return (
    <AppLayout title="Batch Image Processor">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Drop Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                  isDragOver
                    ? "border-blue-500 bg-blue-500/5"
                    : "border-border/50 hover:border-blue-500/50 hover:bg-muted/30"
                }`}
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl mb-4 transition-all ${
                    isDragOver
                      ? "bg-blue-500/20 text-blue-400 scale-110"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Upload className="h-8 w-8" />
                </div>
                <p className="text-sm font-medium">
                  Drag & drop scanned book images here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports JPG, PNG • Multiple files OK
                </p>
                <label className="mt-4 cursor-pointer">
                  <span className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-accent transition-colors">
                    <FolderOpen className="h-4 w-4" />
                    Browse Files
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && addFiles(e.target.files)}
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Queue & Controls */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm font-semibold">
                    Processing Queue — {files.length} file
                    {files.length !== 1 ? "s" : ""}
                    {done > 0 && (
                      <span className="text-emerald-400 ml-2">
                        ({done} done)
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={capturesRunning}
                      onClick={runCaptures}
                      className="gap-2"
                    >
                      {capturesRunning ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />{" "}
                          Processing Captures
                        </>
                      ) : (
                        <>
                          <FolderOpen className="h-4 w-4" /> Process Captures
                          Folder
                        </>
                      )}
                    </Button>
                    {done > 0 && (
                      <Button variant="outline" size="sm" onClick={clearDone}>
                        Clear Done
                      </Button>
                    )}
                    <Button
                      size="sm"
                      disabled={isRunning || queued === 0}
                      onClick={
                        isRunning
                          ? () => {
                              stopRef.current = true;
                            }
                          : startProcessing
                      }
                      className={`gap-2 text-white border-0 ${
                        isRunning
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Stop
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" /> Start Processing
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {capturesSummary && (
                  <div className="mb-3 text-[11px] text-muted-foreground">
                    {capturesSummary.message ? (
                      <span className="text-red-400">
                        {capturesSummary.message}
                      </span>
                    ) : (
                      <span>
                        Captures processed: {capturesSummary.total} • Errors:{" "}
                        {capturesSummary.errors}
                      </span>
                    )}
                  </div>
                )}
                <div className="space-y-3">
                  <AnimatePresence>
                    {files.map((file, i) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
                      >
                        <FileImage className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress
                              value={file.progress}
                              className="h-1.5 flex-1"
                            />
                            <span className="text-[10px] text-muted-foreground w-8 text-right">
                              {file.progress}%
                            </span>
                          </div>
                          {/* Result summary */}
                          {file.result && (
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] text-purple-400 flex items-center gap-1">
                                <Sigma className="h-3 w-3" />
                                {file.result.detections} formula
                                {file.result.detections !== 1 ? "s" : ""}
                              </span>
                              <span className="text-[10px] text-amber-400">
                                {file.result.latency_ms}ms
                              </span>
                              {file.result.latex_blocks.length > 0 && (
                                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                  <BookOpenText className="h-3 w-3" />
                                  {file.result.latex_blocks.length} LaTeX block
                                  {file.result.latex_blocks.length !== 1
                                    ? "s"
                                    : ""}
                                </span>
                              )}
                            </div>
                          )}
                          {file.error && (
                            <p className="text-[10px] text-red-400 mt-1">
                              {file.error}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-muted-foreground">
                            {formatSize(file.size)}
                          </span>
                          {file.status === "done" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : file.status === "error" ? (
                            <AlertCircle className="h-4 w-4 text-red-400" />
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-[10px] capitalize"
                            >
                              {file.status}
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
