"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHealth, usePages } from "@/hooks/use-smartscan";
import { flaskApi, PageContent } from "@/lib/flask-api";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Sigma,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/** Render markdown with inline $...$ and display $$...$$ via KaTeX */
function MarkdownRenderer({ markdown }: { markdown: string }) {
  const [parts, setParts] = useState<
    { type: "text" | "math" | "display"; content: string }[]
  >([]);

  useEffect(() => {
    // Split on $$...$$ first (display math), then $...$ (inline)
    const segments: { type: "text" | "math" | "display"; content: string }[] =
      [];
    const displayParts = markdown.split(/\$\$([\s\S]*?)\$\$/g);
    displayParts.forEach((part, i) => {
      if (i % 2 === 1) {
        segments.push({ type: "display", content: part.trim() });
      } else {
        // Split inline math
        const inlineParts = part.split(/\$(.*?)\$/g);
        inlineParts.forEach((ip, j) => {
          if (j % 2 === 1) {
            segments.push({ type: "math", content: ip });
          } else if (ip) {
            segments.push({ type: "text", content: ip });
          }
        });
      }
    });
    setParts(segments);
  }, [markdown]);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
      {parts.map((seg, i) => {
        if (seg.type === "display")
          return <DisplayMath key={i} latex={seg.content} />;
        if (seg.type === "math")
          return <InlineMath key={i} latex={seg.content} />;
        // Render text with paragraph breaks
        return seg.content.split("\n\n").map((para, j) =>
          para.trim() ? (
            <p
              key={`${i}-${j}`}
              className="mb-3 text-foreground/90 text-sm leading-7"
            >
              {para.trim()}
            </p>
          ) : null,
        );
      })}
    </div>
  );
}

function DisplayMath({ latex }: { latex: string }) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    import("katex").then((k) => {
      try {
        setHtml(
          k.default.renderToString(latex, {
            throwOnError: false,
            displayMode: true,
          }),
        );
      } catch {
        setHtml(`<span style="color:red">${latex}</span>`);
      }
    });
  }, [latex]);
  return (
    <div
      className="my-4 py-3 px-4 bg-muted/20 rounded-xl border border-border/20 overflow-x-auto text-center text-xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function InlineMath({ latex }: { latex: string }) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    import("katex").then((k) => {
      try {
        setHtml(
          k.default.renderToString(latex, {
            throwOnError: false,
            displayMode: false,
          }),
        );
      } catch {
        setHtml(`<span>${latex}</span>`);
      }
    });
  }, [latex]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function ReaderPage() {
  const { pages, pagesLoading } = usePages();
  const { health, healthLoading } = useHealth();
  const [currentPageNum, setCurrentPageNum] = useState<number | null>(null);
  const [content, setContent] = useState<PageContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [compilingPdf, setCompilingPdf] = useState(false);
  const [viewMode, setViewMode] = useState<"reader" | "pdf">("reader");
  const pdfReady = Boolean(health?.pandoc);

  // Auto-select first page
  useEffect(() => {
    if (pages.length > 0 && currentPageNum === null)
      setCurrentPageNum(pages[0].number);
  }, [pages, currentPageNum]);

  // Load content on page change
  useEffect(() => {
    if (currentPageNum === null) return;
    setLoadingContent(true);
    setContent(null);
    flaskApi
      .page(currentPageNum)
      .then(setContent)
      .catch(() => setContent(null))
      .finally(() => setLoadingContent(false));
  }, [currentPageNum]);

  const currentIndex = pages.findIndex((p) => p.number === currentPageNum);
  const prevPage = () =>
    currentIndex > 0 && setCurrentPageNum(pages[currentIndex - 1].number);
  const nextPage = () =>
    currentIndex < pages.length - 1 &&
    setCurrentPageNum(pages[currentIndex + 1].number);

  const downloadPdf = useCallback(async () => {
    setCompilingPdf(true);
    try {
      const url = flaskApi.pdfUrl();
      const a = document.createElement("a");
      a.href = url + "?force=false";
      a.download = "SmartScan_Book.pdf";
      a.click();
    } finally {
      setTimeout(() => setCompilingPdf(false), 2000);
    }
  }, []);

  const compileFreshPdf = useCallback(async () => {
    setCompilingPdf(true);
    try {
      const res = await fetch(flaskApi.pdfUrl() + "?force=true");
      if (res.ok) {
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "SmartScan_Book.pdf";
        a.click();
      }
    } finally {
      setCompilingPdf(false);
    }
  }, []);

  return (
    <AppLayout title="Book Reader">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css"
      />
      <div className="max-w-5xl mx-auto space-y-4">
        {!healthLoading && !pdfReady && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-amber-500/40 bg-amber-500/10">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-xs text-amber-200">
                  <span className="font-semibold">PDF not ready:</span>
                  <span>
                    Pandoc or the PDF engine
                    {health?.pdf_engine ? ` (${health.pdf_engine})` : ""} is
                    missing. Install a TeX engine (MiKTeX/TeX Live) and Pandoc.
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Header controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Mode toggle */}
                <div className="flex rounded-lg overflow-hidden border border-border/50">
                  <button
                    onClick={() => setViewMode("reader")}
                    className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all ${
                      viewMode === "reader"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <BookOpenText className="h-3.5 w-3.5" />
                    Reader
                  </button>
                  <button
                    onClick={() => setViewMode("pdf")}
                    className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all ${
                      viewMode === "pdf"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    PDF View
                  </button>
                </div>

                {/* Page info */}
                {pages.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Page{" "}
                    <span className="font-semibold text-foreground">
                      {currentIndex + 1}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground">
                      {pages.length}
                    </span>
                  </span>
                )}

                <div className="flex-1" />

                {/* Stats */}
                {content && (
                  <>
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Sigma className="h-2.5 w-2.5" />
                      {content.latex_blocks.length} formula
                      {content.latex_blocks.length !== 1 ? "s" : ""}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <BookOpen className="h-2.5 w-2.5" />
                      {(content.markdown.length / 1000).toFixed(1)}k chars
                    </Badge>
                  </>
                )}

                {/* Download buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={downloadPdf}
                  disabled={compilingPdf || pages.length === 0}
                >
                  {compilingPdf ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={compileFreshPdf}
                  disabled={compilingPdf || pages.length === 0}
                  title="Recompile PDF from all processed pages"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Recompile
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main content */}
        {pagesLoading ? (
          <Card className="border-border/50">
            <CardContent className="p-8 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : pages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-24">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-4">
                  <BookOpenText className="h-10 w-10 text-blue-400" />
                </div>
                <p className="text-sm font-semibold">No pages digitized yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm text-center">
                  Process scanned images in the Batch Processor. Each page will
                  appear here as a beautifully rendered document with LaTeX
                  formulas.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : viewMode === "pdf" ? (
          /* PDF Viewer */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-0">
                <iframe
                  src={flaskApi.pdfUrl() + "?force=false"}
                  className="w-full h-[80vh]"
                  title="SmartScan Book PDF"
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Markdown + KaTeX Reader */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-3 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                      {currentPageNum}
                    </div>
                    Page {currentIndex + 1}
                    {content?.latex_blocks.length ? (
                      <Badge className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/30">
                        {content.latex_blocks.length} formula
                        {content.latex_blocks.length !== 1 ? "s" : ""}
                      </Badge>
                    ) : null}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 min-h-[60vh]">
                <AnimatePresence mode="wait">
                  {loadingContent ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Skeleton
                            key={i}
                            className={`h-4 ${i % 3 === 0 ? "w-3/4" : "w-full"}`}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : content?.found ? (
                    <motion.div
                      key={currentPageNum}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MarkdownRenderer markdown={content.markdown} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="notfound"
                      className="flex items-center justify-center h-40 text-muted-foreground"
                    >
                      <p className="text-sm">Page content not found</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Navigation */}
        {pages.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={currentIndex <= 0}
                    onClick={prevPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {/* Page thumbnails */}
                  <div className="flex gap-1 overflow-x-auto max-w-lg py-1">
                    {pages.map((p) => (
                      <button
                        key={p.number}
                        onClick={() => setCurrentPageNum(p.number)}
                        className={`h-7 min-w-[2rem] px-2 rounded text-xs font-mono shrink-0 transition-all ${
                          currentPageNum === p.number
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110"
                            : "bg-muted/40 hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.number}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={currentIndex >= pages.length - 1}
                    onClick={nextPage}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
