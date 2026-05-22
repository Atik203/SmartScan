"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Sigma, Copy, Download, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePages } from "@/hooks/use-smartscan";
import { flaskApi, PageContent } from "@/lib/flask-api";
import { cleanAndBalanceLatex } from "@/lib/utils";

function KatexBlock({ latex, display = true }: { latex: string; display?: boolean }) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    const balanced = cleanAndBalanceLatex(latex);
    import("katex").then((k) => {
      try {
        setHtml(k.default.renderToString(balanced, { throwOnError: false, displayMode: display }));
      } catch {
        setHtml(`<span style="color:orange;font-size:0.75rem">${latex}</span>`);
      }
    });
  }, [latex, display]);
  return (
    <div
      className={`overflow-x-auto ${display ? "py-3 px-4 text-xl" : "inline"}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function LatexPage() {
  const { pages, pagesLoading } = usePages();
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [editorLatex, setEditorLatex] = useState(
    "\\frac{x^2 + y}{z_n} = \\sum_{i=0}^{n} \\alpha_i \\cdot \\beta^{i}"
  );
  const [editorHtml, setEditorHtml] = useState("");
  const [copied, setCopied] = useState(false);

  // Render live editor
  useEffect(() => {
    const balanced = cleanAndBalanceLatex(editorLatex);
    import("katex").then((k) => {
      try {
        setEditorHtml(k.default.renderToString(balanced, { throwOnError: false, displayMode: true }));
      } catch {
        setEditorHtml(`<span style="color:orange;font-size:0.8rem">Cannot render — try fixing the expression</span>`);
      }
    });
  }, [editorLatex]);

  // Load page content when selection changes
  useEffect(() => {
    if (selectedPage === null) return;
    setLoadingContent(true);
    flaskApi.page(selectedPage).then((c) => {
      setPageContent(c);
      if (c.latex_blocks.length > 0) setEditorLatex(c.latex_blocks[0]);
    }).catch(() => setPageContent(null)).finally(() => setLoadingContent(false));
  }, [selectedPage]);

  // Auto-select first page
  useEffect(() => {
    if (pages.length > 0 && selectedPage === null) setSelectedPage(pages[0].number);
  }, [pages, selectedPage]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const exportTex = () => {
    if (!pageContent) return;
    const content = pageContent.latex_blocks.join("\n\n$$\n") ;
    const blob = new Blob([`% SmartScan LaTeX Export\n% Page ${selectedPage}\n\n$$\n${content}\n$$`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `page_${String(selectedPage).padStart(3, "0")}_formulas.tex`;
    a.click();
  };

  const currentIndex = pages.findIndex((p) => p.number === selectedPage);

  return (
    <AppLayout title="LaTeX Expression Preview">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css" />
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Page Selector */}
        {pages.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-muted-foreground font-medium">Select Page:</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      disabled={currentIndex <= 0}
                      onClick={() => setSelectedPage(pages[currentIndex - 1]?.number)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-1 flex-wrap max-w-2xl">
                      {pages.map((p) => (
                        <button
                          key={p.number}
                          onClick={() => setSelectedPage(p.number)}
                          className={`h-7 min-w-[2rem] px-2 rounded text-xs font-mono transition-all ${
                            selectedPage === p.number
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                              : "bg-muted/40 hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {p.number}
                          {p.latex_count > 0 && (
                            <span className="ml-1 text-[8px] opacity-70">({p.latex_count})</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      disabled={currentIndex >= pages.length - 1}
                      onClick={() => setSelectedPage(pages[currentIndex + 1]?.number)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge variant="secondary" className="text-[10px] ml-auto">
                    {pages.length} page{pages.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Live Editor */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sigma className="h-4 w-4 text-purple-400" />
                  LaTeX Editor & Live Preview
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleCopy(editorLatex)}>
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={exportTex} disabled={!pageContent}>
                    <Download className="h-3.5 w-3.5" />
                    Export .tex
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">LaTeX Code</label>
                <Textarea
                  value={editorLatex}
                  onChange={(e) => setEditorLatex(e.target.value)}
                  className="font-mono text-sm min-h-[80px] bg-muted/30 border-border/50 resize-none"
                  placeholder="Enter LaTeX expression..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Rendered Preview</label>
                <div
                  className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-border/30 min-h-[80px] flex items-center justify-center text-2xl overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: editorHtml }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Local ML Proof of Work Card */}
        {pageContent && pageContent.trocr_results && pageContent.trocr_results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-border/50 bg-gradient-to-br from-muted/20 to-muted/50 border-purple-500/25">
              <CardHeader className="pb-3 border-b border-border/20">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                  Local ML Proof of Work (Offline YOLOv8 + TrOCR)
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">
                  Verification of fine-tuned local models running offline, before final API assembly.
                </p>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid gap-4">
                  {pageContent.trocr_results.map((res, i) => {
                    const box = pageContent.boxes?.[i];
                    const base = pageContent.source_file
                      ? pageContent.source_file.substring(0, pageContent.source_file.lastIndexOf('.'))
                      : "";
                    const cropUrl = base && res.filename
                      ? flaskApi.imageUrl(`/images/extracted/${base}/${res.filename}`)
                      : null;

                    return (
                      <div
                        key={i}
                        className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-border/40 bg-card/60 hover:bg-card transition-all"
                      >
                        {/* Crop Image Column */}
                        <div className="flex flex-col items-center justify-center bg-white p-2 rounded-lg border border-border/20 w-full md:w-48 h-20 overflow-hidden relative group shrink-0">
                          {cropUrl ? (
                            <img
                              src={cropUrl}
                              alt={`Crop ${i + 1}`}
                              className="max-h-full max-w-full object-contain filter contrast-125 select-none"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-mono">No Image Crop</span>
                          )}
                          <span className="absolute bottom-1 right-1 bg-black/60 text-[8px] font-mono px-1 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            {res.filename}
                          </span>
                        </div>

                        {/* Metadata & LaTeX Output */}
                        <div className="flex-1 flex flex-col justify-between gap-2 min-w-0">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0">
                                Box {i + 1}
                              </Badge>
                              {box && (
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  coords: [{box.x1}, {box.y1}, {box.x2}, {box.y2}] | conf: {Math.round(box.confidence * 100)}%
                                </span>
                              )}
                              <Badge className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-none text-[9px] font-mono py-0">
                                Latency: {res.latency_ms}ms
                              </Badge>
                            </div>
                            <div className="mt-1.5">
                              <code className="text-xs text-purple-300 font-mono select-all break-all bg-purple-950/20 dark:bg-purple-950/30 p-1.5 rounded block border border-purple-500/10">
                                {res.latex}
                              </code>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 mt-2">
                            <div className="text-xs font-medium text-muted-foreground">KaTeX Preview:</div>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-6 text-[10px] gap-1 hover:bg-purple-500 hover:text-white transition-all shrink-0"
                              onClick={() => {
                                const balanced = cleanAndBalanceLatex(res.latex);
                                setEditorLatex(balanced);
                                handleCopy(balanced);
                              }}
                            >
                              <Copy className="h-2.5 w-2.5" />
                              Copy & Import
                            </Button>
                          </div>
                        </div>

                        {/* KaTeX Live Render Column */}
                        <div className="flex-1 flex items-center justify-center p-4 rounded-lg bg-zinc-950/5 border border-border/20 min-h-[5rem] overflow-x-auto text-lg">
                          <KatexBlock latex={res.latex} display={true} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Extracted Formulas from selected page */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Extracted Formulas
                {selectedPage && <span className="text-muted-foreground font-normal ml-2">— Page {selectedPage}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pagesLoading || loadingContent ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : !pageContent || pageContent.latex_blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Sigma className="h-12 w-12 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">
                    {pages.length === 0 ? "No pages processed yet" : "No formulas on this page"}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {pages.length === 0
                      ? "Process images in the Batch Processor first"
                      : "Select a page with math expressions"}
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedPage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {pageContent.latex_blocks.map((latex, i) => (
                      <div key={i} className="rounded-xl border border-border/30 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b border-border/20">
                          <span className="text-[10px] text-purple-400 font-mono font-bold uppercase tracking-wide">
                            Formula {i + 1}
                          </span>
                          <Button
                            variant="ghost" size="sm" className="h-6 text-[10px] gap-1"
                            onClick={() => { setEditorLatex(latex); handleCopy(latex); }}
                          >
                            <Copy className="h-2.5 w-2.5" />
                            Use in editor
                          </Button>
                        </div>
                        {/* Rendered */}
                        <div className="p-4 bg-white dark:bg-zinc-900 flex items-center justify-center">
                          <KatexBlock latex={latex} display={true} />
                        </div>
                        {/* Source */}
                        <div className="px-4 py-2 bg-muted/10 border-t border-border/20">
                          <code className="text-[10px] text-muted-foreground font-mono break-all">
                            {latex.length > 120 ? latex.slice(0, 120) + "…" : latex}
                          </code>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
