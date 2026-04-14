import { AnalysisResult } from './analysis.types';

export interface AnalyzeInput {
  files: { path: string; content: string }[];
  businessRequirements?: string;
  /** Alias used by CodeGuardian `POST /scan` (newline-separated requirements). */
  requirements?: string;
  language?: string;
  analysisModes?: string[];
}

export const ANALYSIS_PROVIDER = Symbol('ANALYSIS_PROVIDER');

export interface AnalysisProvider {
  analyze(input: AnalyzeInput): Promise<AnalysisResult>;
}
