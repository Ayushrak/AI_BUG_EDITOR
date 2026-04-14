export type FindingSeverity =
  | 'info'
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type FindingCategory =
  | 'security'
  | 'logic'
  | 'performance'
  | 'architecture'
  | 'style'
  | 'testing'
  | 'business_rule';

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

export interface RequirementCheckResult {
  id: string;
  requirement: string;
  status: 'pass' | 'fail' | 'warning';
  notes: string;
}

export interface AgentContribution {
  agentId: string;
  name: string;
  findingCount: number;
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
  /** Populated by CodeGuardian static agents / orchestrator. */
  riskScore?: number;
  overallScore?: number;
  requirementChecks?: RequirementCheckResult[];
  agentContributions?: AgentContribution[];
  /** Full Asset-Manager-compatible payload when using static agents. */
  legacyScan?: unknown;
}
