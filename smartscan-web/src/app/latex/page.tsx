"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sigma, Copy, Download, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function LatexPage() {
  const [latexInput, setLatexInput] = useState(
    "\\frac{x^2 + y}{z_n} = \\sum_{i=0}^{n} \\alpha_i \\cdot \\beta^{i}"
  );
  const [rendered, setRendered] = useState("");
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically import KaTeX for client-side rendering
    import("katex").then((katex) => {
      try {
        const html = katex.default.renderToString(latexInput, {
          throwOnError: false,
          displayMode: true,
        });
        setRendered(html);
      } catch {
        setRendered("<span style='color: red;'>Invalid LaTeX</span>");
      }
    });
  }, [latexInput]);

  const handleCopy = () => {
    navigator.clipboard.writeText(latexInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout title="LaTeX Expression Preview">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Live LaTeX Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sigma className="h-4 w-4 text-purple-400" />
                  LaTeX Editor & Preview
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Download className="h-3.5 w-3.5" />
                    Export .tex
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Input */}
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">
                  LaTeX Code
                </label>
                <Textarea
                  value={latexInput}
                  onChange={(e) => setLatexInput(e.target.value)}
                  className="font-mono text-sm min-h-[80px] bg-muted/30 border-border/50 resize-none"
                  placeholder="Enter LaTeX expression..."
                />
              </div>

              {/* Preview */}
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">
                  Rendered Preview
                </label>
                <div
                  ref={previewRef}
                  className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-border/30 min-h-[80px] flex items-center justify-center text-2xl overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: rendered }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Extracted Formulas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Extracted Formulas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <Sigma className="h-12 w-12 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                  No formulas extracted yet
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Process images to see detected math expressions with their LaTeX conversions
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* KaTeX CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css"
        />
      </div>
    </AppLayout>
  );
}
