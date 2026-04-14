import { Injectable } from '@nestjs/common';
import type { AnalyzeInput } from '../analysis.provider';
import type {
  AnalysisResult,
  BusinessRuleGap,
  EdgeCaseSuggestion,
  RequirementCheckResult,
} from '../analysis.types';
import { CodeguardianStaticAgentsService } from './codeguardian-static-agents.service';
import type { LegacyScanResponse } from './codeguardian.types';

@Injectable()
export class CodeguardianOrchestratorService {
  constructor(private readonly staticAgents: CodeguardianStaticAgentsService) {}

  /**
   * Runs CodeGuardian static multi-agent pipeline (Asset-Manager / scan.ts parity).
   */
  analyze(input: AnalyzeInput): {
    result: AnalysisResult;
    legacy: LegacyScanResponse;
  } {
    const primary =
      input.files[0] ?? ({ path: 'snippet', content: '' } as { path: string; content: string });
    const combined = input.files
      .map((f) => `// --- file: ${f.path} ---\n${f.content}`)
      .join('\n\n');
    const code = combined || primary.content;
    const filename = primary.path;
    const requirements =
      input.businessRequirements?.trim() || input.requirements?.trim();

    const pipeline = this.staticAgents.run(code, requirements, filename);

    const allFindings = pipeline.slices.flatMap((s) => s.findings);
    const edgeCases: EdgeCaseSuggestion[] = pipeline.legacy.edgeCases.map((e) => ({
      description: `${e.scenario} (${e.functionName})`,
      relatedSymbol: e.functionName,
    }));

    const businessRuleGaps: BusinessRuleGap[] = [];
    for (const c of pipeline.legacy.requirementsChecks) {
      if (c.status === 'fail') {
        businessRuleGaps.push({ requirement: c.requirement, gap: c.notes });
      }
    }

    const requirementChecks: RequirementCheckResult[] =
      pipeline.legacy.requirementsChecks.map((c) => ({
        id: c.id,
        requirement: c.requirement,
        status: c.status,
        notes: c.notes,
      }));

    const agentContributions = pipeline.slices.map((s) => ({
      agentId: s.agentId,
      name: s.name,
      findingCount: s.findings.length,
    }));

    const result: AnalysisResult = {
      summary: `CodeGuardian static agents: ${pipeline.summaryText}`,
      scores: pipeline.scores,
      findings: allFindings,
      edgeCases,
      businessRuleGaps,
      meta: {
        totalLines: input.files.reduce((n, f) => n + f.content.split('\n').length, 0),
        fileCount: input.files.length,
        provider: 'codeguardian-static-agents',
        analyzedAt: new Date().toISOString(),
      },
      riskScore: pipeline.legacy.riskScore,
      overallScore: pipeline.legacy.overallScore,
      requirementChecks,
      agentContributions,
      legacyScan: pipeline.legacy,
    };

    return { result, legacy: pipeline.legacy };
  }
}
