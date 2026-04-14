export type FindingSeverity =
  | "info"
  | "low"
  | "medium"
  | "high"
  | "critical";

export type FindingCategory =
  | "security"
  | "logic"
  | "performance"
  | "architecture"
  | "style"
  | "testing"
  | "business_rule";

export interface AnalysisFinding {
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  filePath?: string;
  lineHint?: number;
  suggestedFix?: string;
}

export interface EdgeCaseSuggestion {
  description: string;
  relatedSymbol?: string;
}

export interface BusinessRuleGap {
  requirement: string;
  gap: string;
}

export interface AnalysisScores {
  quality: number;
  security: number;
  performance: number;
  maintainability: number;
}

export interface AnalysisResult {
  summary: string;
  scores: AnalysisScores;
  findings: AnalysisFinding[];
  edgeCases: EdgeCaseSuggestion[];
  businessRuleGaps: BusinessRuleGap[];
  meta: {
    totalLines: number;
    fileCount: number;
    provider: string;
    analyzedAt: string;
  };
}

export type ScanStatus = "pending" | "running" | "completed" | "failed";

export interface ScanRecord {
  id: string;
  status: ScanStatus;
  createdAt: string;
  updatedAt: string;
  inputSummary: {
    files: { path: string; lines: number }[];
    businessRequirements?: boolean;
    analysisModes?: string[];
  };
  result?: AnalysisResult;
  error?: { message: string };
}

export interface CreateScanPayload {
  files: { path: string; content: string }[];
  businessRequirements?: string;
  analysisModes?: string[];
}

export type DeveloperRole = "junior" | "mid" | "senior" | "lead";

export interface Developer {
  id: string;
  name: string;
  email: string;
  role: DeveloperRole;
  avatarUrl?: string;
  avgQualityScore: number;
  totalPrs: number;
  bugsFixed: number;
  bugsIntroduced: number;
}

export interface AnalyticsOverview {
  metrics: {
    codeQualityScore: number;
    bugsDetected: number;
    securityIssues: number;
    codeScans: number;
    security: number;
    performance: number;
  };
  qualityTrend: { day: string; qualityScore: number }[];
  issueBreakdown: { label: string; count: number; pct: number }[];
  teamPerformance: { name: string; score: number; scans: number }[];
}

export interface DeveloperAnalytics {
  qualityTrend: { date: string; qualityScore: number }[];
  strengths: string[];
  improvementAreas: string[];
  recentPrs: {
    id: string;
    title: string;
    repository: string;
    status: "open" | "merged";
    qualityScore?: number;
    updatedAt: string;
  }[];
}
