"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePages } from "@/hooks/use-smartscan";
import { flaskApi, GalleryItem } from "@/lib/flask-api";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, Layers, Search, ZoomIn } from "lucide-react";
import { useEffect, useState } from "react";

interface PanelProps {
  label: string;
  src: string | null;
  accent: string;
}

function ImagePanel({ label, src, accent }: PanelProps) {
  const [zoom, setZoom] = useState(false);
  if (!src) {
    return (
      <div className="flex-1 flex flex-col gap-1.5">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${accent}`}
        >
          {label}
        </span>
        <div className="flex-1 min-h-[140px] rounded-lg bg-muted/30 border border-border/20 flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
        </div>
      </div>
    );
  }
  return (
    <>
      <div
        className="flex-1 flex flex-col gap-1.5 group cursor-zoom-in"
        onClick={() => setZoom(true)}
      >
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${accent}`}
        >
          {label}
        </span>
        <div className="relative flex-1 min-h-[140px] rounded-lg overflow-hidden border border-border/20 bg-muted/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={flaskApi.imageUrl(src)}
            alt={label}
            className="w-full h-full object-contain transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
            <ZoomIn className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setZoom(false)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={flaskApi.imageUrl(src)}
              alt={label}
              className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function GalleryPage() {
  const { pages, pagesLoading } = usePages();
  const [query, setQuery] = useState("");
  const [galleryBySource, setGalleryBySource] = useState<
    Record<string, GalleryItem>
  >({});

  useEffect(() => {
    let active = true;
    const toLoad = pages
      .map((p) => p.source_file)
      .filter((s): s is string => Boolean(s) && !galleryBySource[s]);

    if (toLoad.length === 0) return;

    (async () => {
      try {
        const results = await Promise.all(
          toLoad.map((name) => flaskApi.gallery(name)),
        );
        if (!active) return;
        setGalleryBySource((prev) => {
          const next = { ...prev };
          results.forEach((item, i) => {
            next[toLoad[i]] = item;
          });
          return next;
        });
      } catch {
        // Ignore per-item failures; placeholders will show instead.
      }
    })();

    return () => {
      active = false;
    };
  }, [pages, galleryBySource]);

  const filtered = pages.filter((p) => {
    const haystack = `${p.filename} ${p.source_file ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <AppLayout title="Detection Gallery">
      <div className="space-y-6">
        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by filename..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-muted/30 border-border/50"
            />
          </div>
          <Badge variant="secondary" className="text-xs">
            {pagesLoading
              ? "…"
              : `${filtered.length} page${filtered.length !== 1 ? "s" : ""}`}
          </Badge>
        </motion.div>

        {/* Loading skeletons */}
        {pagesLoading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!pagesLoading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
                  Upload & process images in the Batch Processor to see the
                  Original → Dewarped → Detected comparison here.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Gallery cards */}
        {!pagesLoading && (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((page, i) => (
                <motion.div
                  key={page.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-border/50 overflow-hidden hover:border-border transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold shrink-0">
                          {page.number}
                        </div>
                        <p className="text-sm font-medium font-mono flex-1 truncate">
                          {page.filename}
                        </p>
                        <div className="flex items-center gap-2">
                          {page.latex_count > 0 && (
                            <Badge className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/30">
                              <Layers className="h-2.5 w-2.5 mr-1" />
                              {page.latex_count} formula
                              {page.latex_count !== 1 ? "s" : ""}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-[10px]">
                            {(page.char_count / 1000).toFixed(1)}k chars
                          </Badge>
                        </div>
                      </div>

                      {/* Three panel comparison */}
                      <div className="flex gap-3">
                        {(() => {
                          const key = page.source_file ?? "";
                          const gallery = key
                            ? galleryBySource[key]
                            : undefined;
                          return (
                            <>
                              <ImagePanel
                                label="Original"
                                src={gallery?.original ?? null}
                                accent="text-blue-400"
                              />
                              <ImagePanel
                                label="Dewarped"
                                src={gallery?.dewarped ?? null}
                                accent="text-purple-400"
                              />
                              <ImagePanel
                                label="Detected"
                                src={gallery?.detected ?? null}
                                accent="text-emerald-400"
                              />
                            </>
                          );
                        })()}
                      </div>

                      {/* Preview text */}
                      {page.preview && (
                        <p className="text-[11px] text-muted-foreground mt-3 line-clamp-2 font-mono border-t border-border/20 pt-2">
                          {page.preview}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
