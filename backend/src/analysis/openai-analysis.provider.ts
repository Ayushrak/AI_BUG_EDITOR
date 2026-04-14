import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CODEGUARDIAN_DOMAIN_CONTEXT } from './codeguardian/codeguardian-domain.context';
import { AnalysisProvider, AnalyzeInput } from './analysis.provider';
import {
  AnalysisFinding,
  AnalysisResult,
  AnalysisScores,
  BusinessRuleGap,
  EdgeCaseSuggestion,
} from './analysis.types';

@Injectable()
export class OpenAiAnalysisProvider implements AnalysisProvider {
  private readonly logger = new Logger(OpenAiAnalysisProvider.name);

  constructor(private readonly config: ConfigService) {}

  async analyze(input: AnalyzeInput): Promise<AnalysisResult> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    const model = this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';

    const payload = this.buildUserPayload(input);
    const body = {
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' as const },
      messages: [
        {
          role: 'system' as const,
          content: `${CODEGUARDIAN_DOMAIN_CONTEXT}

You are a senior staff engineer doing code review. Output ONLY valid JSON matching this shape:
{
  "summary": string,
  "scores": { "quality": number, "security": number, "performance": number, "maintainability": number },
  "findings": Array<{ "category": "security"|"logic"|"performance"|"architecture"|"style"|"testing"|"business_rule", "severity": "info"|"low"|"medium"|"high"|"critical", "title": string, "description": string, "filePath"?: string, "lineHint"?: number, "suggestedFix"?: string }>,
  "edgeCases": Array<{ "description": string, "relatedSymbol"?: string }>,
  "businessRuleGaps": Array<{ "requirement": string, "gap": string }>
}
Scores are 0-10. Be concise; limit findings to the most important 12.`,
        },
        { role: 'user' as const, content: payload },
      ],
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`OpenAI error ${res.status}: ${text}`);
      throw new Error(`OpenAI request failed: ${res.status}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) {
      throw new Error('Empty OpenAI response');
    }

    const parsed = this.safeParse(raw);
    const totalLines = input.files.reduce(
      (n, f) => n + f.content.split('\n').length,
      0,
    );

    return {
      summary: parsed.summary,
      scores: this.normalizeScores(parsed.scores),
      findings: parsed.findings ?? [],
      edgeCases: parsed.edgeCases ?? [],
      businessRuleGaps: parsed.businessRuleGaps ?? [],
      meta: {
        totalLines,
        fileCount: input.files.length,
        provider: `openai:${model}`,
        analyzedAt: new Date().toISOString(),
      },
    };
  }

  private buildUserPayload(input: AnalyzeInput): string {
    const files = input.files
      .map(
        (f) =>
          `### ${f.path}\n\`\`\`\n${f.content.slice(0, 80_000)}\n\`\`\``,
      )
      .join('\n\n');
    const modes = (input.analysisModes?.length ? input.analysisModes : [
      'security',
      'logic',
      'performance',
      'architecture',
      'style',
      'testing',
    ]).join(', ');
    const reqText =
      input.businessRequirements?.trim() || input.requirements?.trim();
    const br = reqText
      ? `\n\nBusiness requirements:\n${reqText.slice(0, 16_000)}`
      : '';
    return `Analyze the following code. Focus on: ${modes}.${br}\n\n${files}`;
  }

  private safeParse(raw: string): {
    summary: string;
    scores?: Partial<AnalysisScores>;
    findings?: AnalysisFinding[];
    edgeCases?: EdgeCaseSuggestion[];
    businessRuleGaps?: BusinessRuleGap[];
  } {
    try {
      return JSON.parse(raw) as ReturnType<OpenAiAnalysisProvider['safeParse']>;
    } catch {
      this.logger.warn('Failed to parse JSON from model; returning fallback envelope');
      return {
        summary: raw.slice(0, 2000),
        scores: { quality: 5, security: 5, performance: 5, maintainability: 5 },
        findings: [
          {
            category: 'logic',
            severity: 'low',
            title: 'Unstructured model output',
            description: 'Could not parse JSON from the model. Inspect raw response server-side.',
          },
        ],
      };
    }
  }

  private normalizeScores(s?: Partial<AnalysisScores>): AnalysisScores {
    const clamp = (n: number) => Math.min(10, Math.max(0, n));
    return {
      quality: clamp(Number(s?.quality ?? 5)),
      security: clamp(Number(s?.security ?? 5)),
      performance: clamp(Number(s?.performance ?? 5)),
      maintainability: clamp(Number(s?.maintainability ?? 5)),
    };
  }
}
