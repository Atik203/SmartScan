"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Play, FolderOpen, FileImage } from "lucide-react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadedFile {
  name: string;
  size: number;
  status: "queued" | "processing" | "done" | "error";
  progress: number;
}

export default function BatchPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        name: f.name,
        size: f.size,
        status: "queued" as const,
        progress: 0,
      }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AppLayout title="Batch Image Processor">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Drop Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
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
                  Supports JPG, PNG, TIFF • Multiple files OK
                </p>
                <label className="mt-4 cursor-pointer">
                  <span className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <FolderOpen className="h-4 w-4" />
                    Browse Files
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Processing Options */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Processing Queue ({files.length} files)
                  </CardTitle>
                  <Button
                    size="sm"
                    className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                  >
                    <Play className="h-4 w-4" />
                    Start Processing
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <AnimatePresence>
                    {files.map((file, i) => (
                      <motion.div
                        key={`${file.name}-${i}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
                      >
                        <FileImage className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={file.progress} className="h-1.5 flex-1" />
                            <span className="text-[10px] text-muted-foreground w-8 text-right">
                              {file.progress}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            {formatSize(file.size)}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] capitalize"
                          >
                            {file.status}
                          </Badge>
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
