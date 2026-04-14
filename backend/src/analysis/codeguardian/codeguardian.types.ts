import type { AnalysisFinding, AnalysisScores } from '../analysis.types';

/** Matches artifacts/api-server scan route response (CodeGuardian / Asset-Manager workspace). */
export interface LegacyScanBug {
  id: string;
  pullRequestId: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  lineNumber: number | null;
  codeSnippet: string | null;
  suggestedFix: string;
  resolved: boolean;
  createdAt: string;
}

export interface LegacySecurityIssue {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  lineNumber: number;
  codeSnippet: string;
  recommendation: string;
}

export interface LegacyPerformanceIssue {
  id: string;
  title: string;
  description: string;
  impact: string;
  lineNumber: number;
  suggestion: string;
}

export interface LegacyArchitectureIssue {
  id: string;
  principle: string;
  title: string;
  description: string;
  recommendation: string;
}

export interface LegacyEdgeCase {
  id: string;
  functionName: string;
  scenario: string;
  testCode: string;
  priority: string;
}

export interface LegacySuggestion {
  id: string;
  title: string;
  description: string;
  originalCode: string | null;
  suggestedCode: string | null;
  type: string;
}

export interface LegacyRequirementCheck {
  id: string;
  requirement: string;
  status: 'pass' | 'fail' | 'warning';
  notes: string;
}

export interface LegacyScanResponse {
  overallScore: number;
  riskScore: number;
  qualityScore: number;
  securityScore: number;
  performanceScore: number;
  maintainabilityScore: number;
  summary: string;
  bugs: LegacyScanBug[];
  securityIssues: LegacySecurityIssue[];
  performanceIssues: LegacyPerformanceIssue[];
  architectureIssues: LegacyArchitectureIssue[];
  edgeCases: LegacyEdgeCase[];
  suggestions: LegacySuggestion[];
  requirementsChecks: LegacyRequirementCheck[];
  linesAnalyzed: number;
}

export interface AgentRunSlice {
  agentId: string;
  name: string;
  findings: AnalysisFinding[];
}

export interface CodeguardianAgentPipelineResult {
  legacy: LegacyScanResponse;
  slices: AgentRunSlice[];
  scores: AnalysisScores;
  summaryText: string;
}
