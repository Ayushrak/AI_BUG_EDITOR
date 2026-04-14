import { Injectable } from '@nestjs/common';
import { AnalysisProvider, AnalyzeInput } from './analysis.provider';
import { AnalysisResult } from './analysis.types';
import { CodeguardianOrchestratorService } from './codeguardian/codeguardian-orchestrator.service';

/**
 * Default “mock” provider now runs the CodeGuardian static multi-agent pipeline
 * (aligned with Asset-Manager artifacts/api-server scan route).
 */
@Injectable()
export class MockAnalysisProvider implements AnalysisProvider {
  constructor(private readonly orchestrator: CodeguardianOrchestratorService) {}

  async analyze(input: AnalyzeInput): Promise<AnalysisResult> {
    return this.orchestrator.analyze(input).result;
  }
}
