"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Play, AlertTriangle, ShieldAlert, BarChart3, CheckCircle, XCircle, Loader2, Code2, FileCode, Sparkles } from "lucide-react";
import { createScan, getScan } from "@/lib/api";
import type { AnalysisResult, ScanRecord } from "@/lib/types";

const fadeIn = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ScanPage() {
  const [code, setCode] = useState("");
  const [filename, setFilename] = useState("untitled.ts");
  const [requirements, setRequirements] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<AnalysisResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScan = useCallback(async () => {
    if (!code.trim()) return;
    setIsScanning(true); setScanResult(null); setScanError(null); setScanProgress(0);
    try {
      setScanProgress(10);
      const createResponse = await createScan({
        files: [{ path: filename, content: code }],
        businessRequirements: requirements || undefined,
        analysisModes: ["security", "bugs", "performance", "architecture"],
      });
      setScanProgress(30);
      const scanId = createResponse.id;
      let attempts = 0;
      while (attempts < 60) {
        attempts++;
        setScanProgress(30 + Math.min(attempts * 2, 60));
        const scanRecord: ScanRecord = await getScan(scanId);
        if (scanRecord.status === "completed" && scanRecord.result) { setScanResult(scanRecord.result); setScanProgress(100); break; }
        if (scanRecord.status === "failed") { setScanError(scanRecord.error?.message || "Scan failed"); break; }
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (attempts >= 60) setScanError("Scan timed out.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to scan";
      if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
        setScanError(null);
        setScanResult({
          summary: "Mock analysis results (backend unavailable) — showing sample data to preview the UI.",
          scores: { quality: 78, security: 85, performance: 72, maintainability: 81 },
          findings: [
            { category: "security", severity: "high", title: "Potential SQL Injection", description: "User input concatenated directly into SQL query string.", lineHint: 15, suggestedFix: "Use parameterized queries." },
            { category: "logic", severity: "medium", title: "Unhandled Promise Rejection", description: "Async function lacks a try-catch block.", lineHint: 8, suggestedFix: "Wrap the await in try-catch." },
            { category: "performance", severity: "low", title: "Inefficient Loop Pattern", description: "Array.find inside a loop creates O(n²).", lineHint: 22, suggestedFix: "Pre-compute a Map or Set." },
          ],
          edgeCases: [{ description: "Empty string input not handled" }, { description: "Negative numbers may cause unexpected behavior" }],
          businessRuleGaps: [],
          meta: { totalLines: code.split("\n").length, fileCount: 1, provider: "mock-fallback", analyzedAt: new Date().toISOString() },
        });
      } else {
        setScanError(message);
      }
    } finally { setIsScanning(false); }
  }, [code, filename, requirements]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => { if (typeof ev.target?.result === "string") setCode(ev.target.result); };
    reader.readAsText(file);
  }, []);

  const getSeverityColor = (s: string) => {
    switch (s) { case "critical": return "bg-destructive/20 text-destructive border-destructive/30";
      case "high": return "bg-chart-3/20 text-chart-3 border-chart-3/30";
      case "medium": return "bg-chart-3/15 text-chart-3/80 border-chart-3/20";
      case "low": return "bg-chart-1/20 text-chart-1 border-chart-1/30";
      default: return "bg-muted text-muted-foreground"; }
  };

  const getCategoryIcon = (c: string) => {
    switch (c) { case "security": return <ShieldAlert className="w-4 h-4" />;
      case "performance": return <BarChart3 className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />; }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">Code Scan</h1>
          <p className="text-muted-foreground">Analyze your code for bugs, vulnerabilities, and quality issues with our multi-agent AI</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur border-border overflow-hidden">
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-2"><Code2 className="w-5 h-5 text-primary" /><CardTitle>Paste Code</CardTitle></div>
                <CardDescription>Enter or paste your code here for AI-powered analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-muted-foreground" />
                  <input type="text" value={filename} onChange={(e) => setFilename(e.target.value)}
                    className="text-sm text-muted-foreground bg-transparent border-b border-dashed border-border focus:border-primary focus:outline-none px-1 py-0.5 transition-colors" />
                </div>
                <Textarea placeholder="// Paste your code here..." value={code} onChange={(e) => setCode(e.target.value)}
                  className="h-72 font-mono text-sm bg-background border-border focus:border-primary" />
                <details className="group">
                  <summary className="text-sm text-primary cursor-pointer hover:text-primary/80 font-medium flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" />Add business requirements (optional)</summary>
                  <Textarea placeholder="Describe what this code should do..." value={requirements} onChange={(e) => setRequirements(e.target.value)}
                    className="mt-3 h-24 text-sm bg-background border-border" />
                </details>
                <div className="flex gap-2">
                  <Button onClick={handleScan} disabled={!code || isScanning} className="flex-1 bg-primary hover:bg-primary/90 py-5">
                    {isScanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                    {isScanning ? "Scanning..." : "Scan Code"}
                  </Button>
                  <div className="relative">
                    <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.go,.rs,.rb,.php,.cs" />
                    <Button variant="outline" className="py-5 border-border"><Upload className="h-4 w-4 mr-2" />Upload</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            <Card className="bg-card/50 backdrop-blur border-border">
              <CardHeader className="pb-3"><CardTitle className="text-base">Analysis Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {isScanning && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground"><span>Scanning...</span><span>{scanProgress}%</span></div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <motion.div className="h-2 rounded-full bg-primary" initial={{ width: "0%" }} animate={{ width: `${scanProgress}%` }} transition={{ duration: 0.5 }} />
                    </div>
                    <p className="text-xs text-muted-foreground animate-pulse">AI agents analyzing your code...</p>
                  </div>
                )}
                {scanResult && (
                  <>
                    {[
                      { label: "Quality", value: scanResult.scores.quality, color: "bg-chart-2" },
                      { label: "Security", value: scanResult.scores.security, color: "bg-chart-1" },
                      { label: "Performance", value: scanResult.scores.performance, color: "bg-chart-3" },
                      { label: "Maintainability", value: scanResult.scores.maintainability, color: "bg-chart-5" },
                    ].map((s) => (
                      <div key={s.label}>
                        <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">{s.label}</span><span className="font-bold text-foreground">{s.value}%</span></div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <motion.div className={`h-2 rounded-full ${s.color}`} initial={{ width: "0%" }} animate={{ width: `${s.value}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Issues Found</span><span className="font-bold text-foreground">{scanResult.findings.length}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Edge Cases</span><span className="font-bold text-foreground">{scanResult.edgeCases.length}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Provider</span><Badge variant="secondary" className="text-xs">{scanResult.meta.provider}</Badge></div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <AnimatePresence>
          {scanError && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="border-destructive/30 bg-destructive/10"><CardContent className="pt-6 flex items-center gap-3">
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <div><p className="font-medium text-destructive">Scan Failed</p><p className="text-sm text-destructive/80 mt-1">{scanError}</p></div>
              </CardContent></Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scanResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="bg-card/50 backdrop-blur border-border overflow-hidden">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-chart-2" /><CardTitle>Scan Results</CardTitle></div>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-muted/50 rounded-lg p-1">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="issues">Issues ({scanResult.findings.length})</TabsTrigger>
                      <TabsTrigger value="edge-cases">Edge Cases</TabsTrigger>
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="pt-6 space-y-4">
                      <p className="text-muted-foreground leading-relaxed">{scanResult.summary}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[{ l: "Quality", v: scanResult.scores.quality, i: "📊" }, { l: "Security", v: scanResult.scores.security, i: "🔒" }, { l: "Performance", v: scanResult.scores.performance, i: "⚡" }, { l: "Maintainability", v: scanResult.scores.maintainability, i: "🔧" }].map((s) => (
                          <div key={s.l} className="text-center p-4 rounded-lg bg-accent border border-border">
                            <div className="text-2xl mb-1">{s.i}</div><div className="text-2xl font-bold text-foreground">{s.v}%</div><div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="issues" className="pt-6 space-y-3">
                      {scanResult.findings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground"><CheckCircle className="w-12 h-12 text-chart-2 mx-auto mb-3" /><p className="font-medium">No issues found!</p></div>
                      ) : scanResult.findings.map((f, i) => (
                        <motion.div key={i} variants={fadeIn} initial="hidden" animate="show" transition={{ delay: i * 0.1 }}
                          className="p-4 rounded-lg border border-border hover:border-primary/20 transition-all group">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg border ${getSeverityColor(f.severity)}`}>{getCategoryIcon(f.category)}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-foreground">{f.title}</h4>
                                <Badge className={`text-[10px] px-2 py-0 border ${getSeverityColor(f.severity)}`}>{f.severity.toUpperCase()}</Badge>
                                <Badge variant="secondary" className="text-[10px] px-2 py-0">{f.category}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{f.description}</p>
                              {f.lineHint && <p className="text-xs text-muted-foreground">📍 Line ~{f.lineHint}</p>}
                              {f.suggestedFix && (
                                <div className="mt-3 p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
                                  <p className="text-xs font-medium text-chart-2 mb-1">💡 Suggested Fix</p><p className="text-sm text-chart-2/80">{f.suggestedFix}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </TabsContent>
                    <TabsContent value="edge-cases" className="pt-6 space-y-3">
                      {scanResult.edgeCases.map((ec, i) => (
                        <div key={i} className="p-4 rounded-lg border border-chart-3/20 bg-chart-3/5 flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-chart-3 mt-0.5" /><p className="text-sm text-foreground">{ec.description}</p>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="summary" className="pt-6 space-y-4">
                      <div className="p-4 rounded-lg bg-accent border border-border"><p className="text-sm text-muted-foreground leading-relaxed">{scanResult.summary}</p></div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 rounded-lg border border-border"><p className="text-muted-foreground text-xs">Lines Analyzed</p><p className="font-bold text-foreground text-lg">{scanResult.meta.totalLines}</p></div>
                        <div className="p-3 rounded-lg border border-border"><p className="text-muted-foreground text-xs">Files</p><p className="font-bold text-foreground text-lg">{scanResult.meta.fileCount}</p></div>
                        <div className="p-3 rounded-lg border border-border"><p className="text-muted-foreground text-xs">Provider</p><p className="font-bold text-foreground">{scanResult.meta.provider}</p></div>
                        <div className="p-3 rounded-lg border border-border"><p className="text-muted-foreground text-xs">Analyzed At</p><p className="font-bold text-foreground text-xs">{new Date(scanResult.meta.analyzedAt).toLocaleString()}</p></div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
