import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { AnalysisProvider, AnalyzeInput } from "./analysis.provider";
import { AnalysisResult } from "./analysis.types";

/**
 * FastAPI Analysis Provider - integrates Python multi-agent service
 * Calls Python FastAPI (ai-orchestration) for Groq LLM-based code analysis
 * Falls back to mock response if Python service unavailable
 */
@Injectable()
export class FastAPIAnalysisProvider implements AnalysisProvider {
  private readonly logger = new Logger(FastAPIAnalysisProvider.name);

  constructor(private readonly config: ConfigService) {}

  async analyze(input: AnalyzeInput): Promise<AnalysisResult> {
    const serviceUrl =
      this.config.get<string>("PYTHON_SERVICE_URL") || "http://localhost:8000";
    const code = input.files.map((f) => f.content).join("\n\n");

    try {
      this.logger.debug(`Calling FastAPI service at ${serviceUrl}/api/analyze`);

      const response = await axios.post(
        `${serviceUrl}/api/analyze`,
        {
          code,
          language: input.language || "javascript",
          business_requirements:
            input.businessRequirements || input.requirements,
        },
        {
          timeout: 60000, // 60 second timeout for LLM calls
          headers: { "Content-Type": "application/json" },
        },
      );

      this.logger.debug("FastAPI service returned analysis");
      return this.normalizeResponse(response.data, input);
    } catch (error) {
      this.logger.warn(
        `FastAPI service error: ${error instanceof Error ? error.message : String(error)}`,
      );
      this.logger.warn("Returning mock analysis response");

      // Graceful fallback to mock response
      return this.getMockResponse(input);
    }
  }

  private normalizeResponse(
    data: unknown,
    input: AnalyzeInput,
  ): AnalysisResult {
    // Handle case where response is wrapped in result field
    const result = (data as any).result || data;

    return {
      summary:
        (result.summary as string) || "Python FastAPI analysis completed",
      scores: {
        quality: ((result.scores?.overall as number) ||
          7.5) as unknown as number,
        security: ((result.scores?.security as number) ||
          7.5) as unknown as number,
        performance: ((result.scores?.performance as number) ||
          7.5) as unknown as number,
        maintainability: ((result.scores?.architecture as number) ||
          7.5) as unknown as number,
      },
      findings: (result.findings as any[]) || [],
      edgeCases: (result.edgeCases as any[]) || [],
      businessRuleGaps: (result.businessRuleGaps as any[]) || [],
      meta: {
        totalLines: input.files.reduce(
          (n, f) => n + f.content.split("\n").length,
          0,
        ),
        fileCount: input.files.length,
        provider: "fastapi-groq",
        analyzedAt: new Date().toISOString(),
      },
    };
  }

  private getMockResponse(input: AnalyzeInput): AnalysisResult {
    const lines =
      input.files.length > 0 ? input.files[0].content.split("\n").length : 0;

    return {
      summary: `[MOCK] Analysis of ${input.files.length} file(s) completed. (Python service unavailable)`,
      scores: {
        quality: 7.5,
        security: 8.0,
        performance: 7.0,
        maintainability: 7.5,
      },
      findings: [
        {
          category: "style",
          severity: "info",
          title: "[MOCK] Analysis Service Unavailable",
          description:
            "Python FastAPI service is not responding. This is a mock response. Please check that the Python service is running at the configured PYTHON_SERVICE_URL.",
          filePath: input.files[0]?.path,
          lineHint: 1,
          suggestedFix:
            "Ensure Python service is running on the configured port.",
        },
      ],
      edgeCases: [],
      businessRuleGaps: [],
      meta: {
        totalLines: input.files.reduce(
          (n, f) => n + f.content.split("\n").length,
          0,
        ),
        fileCount: input.files.length,
        provider: "mock-fallback",
        analyzedAt: new Date().toISOString(),
      },
    };
  }
}
