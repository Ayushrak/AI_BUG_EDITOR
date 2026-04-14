"use client";

import { useCallback, useState } from "react";
import { createScan, getScan } from "@/lib/api";
import type { AnalysisResult, ScanRecord } from "@/lib/types";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function getSeverityStyles(sev: string) {
  switch (sev) {
    case "critical":
      return "border-red-500/50 bg-red-500/10 text-red-200";
    case "high":
      return "border-orange-500/50 bg-orange-500/10 text-orange-200";
    case "medium":
      return "border-yellow-500/50 bg-yellow-500/10 text-yellow-200";
    case "low":
      return "border-blue-500/50 bg-blue-500/10 text-blue-200";
    default:
      return "border-slate-500/50 bg-slate-500/10 text-slate-200";
  }
}

function getBadgeClass(sev: string) {
  switch (sev) {
    case "critical":
      return "badge-critical";
    case "high":
      return "badge-high";
    case "medium":
      return "badge-medium";
    case "low":
      return "badge-low";
    default:
      return "badge-info";
  }
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, value * 10));
  const getColor = (v: number) => {
    if (v >= 8) return "from-green-500 to-emerald-500";
    if (v >= 6) return "from-yellow-500 to-amber-500";
    return "from-red-500 to-orange-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-lg font-bold gradient-text">
          {value.toFixed(1)}/10
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-800/50 border border-slate-700/50">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getColor(value)} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ResultsView({ result }: { result: AnalysisResult }) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "findings" | "security" | "performance"
  >("overview");

  const criticalCount = result.findings.filter(
    (f) => f.severity === "critical",
  ).length;
  const highCount = result.findings.filter((f) => f.severity === "high").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Card */}
      <div className="card border-blue-500/30 bg-gradient-to-br from-blue-600/10 to-purple-600/10 overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold gradient-text">
              Analysis Complete
            </h2>
            <p className="text-slate-400 mt-1">
              {result.meta.provider} • {result.meta.totalLines} lines •{" "}
              {result.meta.fileCount} file(s)
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold gradient-text">
              {result.scores.quality.toFixed(1)}
            </div>
            <div className="text-xs text-slate-400">Quality Score</div>
          </div>
        </div>
        <p className="text-slate-300 leading-relaxed">{result.summary}</p>
        {criticalCount > 0 && (
          <div className="mt-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10">
            <p className="text-sm text-red-200">
              ⚠️{" "}
              <strong>
                {criticalCount} critical issue{criticalCount > 1 ? "s" : ""}
              </strong>{" "}
              found that require immediate attention
            </p>
          </div>
        )}
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Quality", value: result.scores.quality },
          { label: "Security", value: result.scores.security },
          { label: "Performance", value: result.scores.performance },
          { label: "Maintainability", value: result.scores.maintainability },
        ].map((score, i) => (
          <div key={i} className="card">
            <ScoreRow label={score.label} value={score.value} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50 rounded-t-lg overflow-x-auto">
        {["overview", "findings", "security", "performance"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "findings" && result.findings.length > 0 && (
              <span className="ml-2 badge-high">{result.findings.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="text-sm text-slate-400 mb-2">
                  🔴 Critical Issues
                </div>
                <div className="text-3xl font-bold text-red-400">
                  {criticalCount}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="text-sm text-slate-400 mb-2">
                  🟠 High Priority
                </div>
                <div className="text-3xl font-bold text-orange-400">
                  {highCount}
                </div>
              </div>
            </div>
            {result.edgeCases.length > 0 && (
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <h4 className="font-semibold text-purple-300 mb-2">
                  Edge Cases Detected
                </h4>
                <ul className="space-y-1 text-sm text-slate-300">
                  {result.edgeCases.slice(0, 3).map((ec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>{ec.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === "findings" && (
          <div className="space-y-3">
            {result.findings.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-4xl mb-2">✨</div>
                <p className="text-slate-400">No issues found! Great code.</p>
              </div>
            ) : (
              result.findings.map((f, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-4 ${getSeverityStyles(f.severity)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-lg mt-1">
                        {getCategoryIcon(f.category)}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-semibold">{f.title}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span
                            className={`text-xs font-semibold ${getBadgeClass(f.severity)}`}
                          >
                            {f.severity.toUpperCase()}
                          </span>
                          <span className="text-xs opacity-70">
                            {f.category}
                          </span>
                          {f.lineHint && (
                            <span className="text-xs opacity-70">
                              Line {f.lineHint}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm opacity-90">{f.description}</p>
                  {f.suggestedFix && (
                    <div className="mt-3 p-2 rounded bg-black/20">
                      <p className="text-xs text-emerald-300 font-medium mb-1">
                        💡 Suggested Fix:
                      </p>
                      <p className="text-xs font-mono">{f.suggestedFix}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-3">
            {result.findings.filter((f) => f.category === "security").length ===
            0 ? (
              <p className="text-slate-400 text-center py-8">
                ✅ No security issues detected
              </p>
            ) : (
              result.findings
                .filter((f) => f.category === "security")
                .map((f, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-4 ${getSeverityStyles(f.severity)}`}
                  >
                    <h4 className="font-semibold mb-1">{f.title}</h4>
                    <p className="text-sm opacity-90">{f.description}</p>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-3">
            {result.findings.filter((f) => f.category === "performance")
              .length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                ⚡ Performance looks good!
              </p>
            ) : (
              result.findings
                .filter((f) => f.category === "performance")
                .map((f, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-4 ${getSeverityStyles(f.severity)}`}
                  >
                    <h4 className="font-semibold mb-1">{f.title}</h4>
                    <p className="text-sm opacity-90">{f.description}</p>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryIcon(cat: string) {
  const icons: Record<string, string> = {
    security: "🔒",
    logic: "🧠",
    performance: "⚡",
    architecture: "🏗️",
    style: "✨",
    testing: "✅",
  };
  return icons[cat] || "📋";
}

export function ScanWorkspace() {
  const [code, setCode] = useState(
    "// Paste or upload your code for AI analysis",
  );
  const [language, setLanguage] = useState("javascript");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = useCallback(async () => {
    if (!code.trim()) {
      setError("Please enter code to analyze");
      return;
    }

    setScanning(true);
    setError(null);

    try {
      const res = await createScan({
        files: [{ path: `file.${language}`, content: code }],
      });
      const scanId = res.id;

      // Poll for results
      let attempts = 0;
      while (attempts < 30) {
        await sleep(1000);
        const scan = await getScan(scanId);
        if (scan.status === "completed" && scan.result) {
          setResult(scan.result);
          setScanning(false);
          return;
        }
        if (scan.status === "failed") {
          setError(scan.error?.message || "Analysis failed");
          setScanning(false);
          return;
        }
        attempts++;
      }

      setError("Analysis timeout");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }

    setScanning(false);
  }, [code, language]);

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setResult(null)}
            className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors font-medium"
          >
            ← Back to Editor
          </button>
        </div>
        <ResultsView result={result} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Code Scanner</h1>
        <p className="text-slate-400">
          Upload or paste code for instant AI analysis — bugs, security,
          performance, and business requirement validation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50">
        <button className="px-4 py-3 font-medium text-sm text-blue-400 border-b-2 border-blue-500">
          📝 Code Editor
        </button>
        <button className="px-4 py-3 font-medium text-sm text-slate-400 hover:text-slate-300 border-b-2 border-transparent">
          ✅ Requirements
        </button>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input-field"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="go">Go</option>
          </select>

          {/* Code Editor */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste or upload your code here for AI analysis"
            className="textarea-field font-mono min-h-96 text-sm"
          />

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10">
              <p className="text-red-300 font-medium">❌ {error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleScan}
              disabled={scanning}
              className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {scanning ? (
                <>
                  <span className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Analyzing...
                </>
              ) : (
                <>🚀 Run AI Scan</>
              )}
            </button>
            <button
              onClick={() => setCode("")}
              className="btn-secondary px-8 py-3 disabled:opacity-50"
              disabled={scanning}
            >
              Clear
            </button>
          </div>

          {/* File Upload */}
          <div className="p-4 rounded-lg border-2 border-dashed border-slate-600 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
            <p className="text-slate-400 text-sm">
              📁 Drag and drop a file or{" "}
              <span className="text-blue-400">click to upload</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              25 lines • Drag and drop a file to load it
            </p>
          </div>
        </div>

        {/* Score Preview */}
        <div className="space-y-4">
          <div className="card bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/30">
            <h3 className="font-semibold mb-4">Preview Scores</h3>
            <div className="space-y-4">
              <ScoreRow label="Quality" value={7.5} />
              <ScoreRow label="Security" value={8.0} />
              <ScoreRow label="Performance" value={7.0} />
              <ScoreRow label="Maintainability" value={7.5} />
            </div>
          </div>

          {/* Features */}
          <div className="card space-y-3">
            <h3 className="font-semibold">What we analyze</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Security vulnerabilities</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Logic errors & bugs</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Performance issues</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Architecture review</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Test case suggestions</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
