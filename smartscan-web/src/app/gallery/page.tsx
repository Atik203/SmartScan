"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function GalleryPage() {
  return (
    <AppLayout title="Detection Gallery">
      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by filename..."
              className="pl-9 bg-muted/30 border-border/50"
            />
          </div>
          <Badge variant="secondary" className="text-xs">
            0 results
          </Badge>
        </motion.div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No processed images yet
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1 max-w-sm text-center">
                Process images through the Batch Processor to see side-by-side
                comparisons of Original → Dewarped → Detected results here.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gallery Grid Template (shown when data exists) */}
        <div className="text-xs text-muted-foreground/40 text-center">
          Each processed image will show a three-panel comparison:
          <span className="font-semibold text-blue-400/60"> Original</span> →
          <span className="font-semibold text-purple-400/60"> Dewarped</span> →
          <span className="font-semibold text-emerald-400/60"> Detected</span>
        </div>
      </div>
    </AppLayout>
  );
}
