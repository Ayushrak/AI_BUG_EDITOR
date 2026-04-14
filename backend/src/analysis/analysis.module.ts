import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ANALYSIS_PROVIDER } from "./analysis.provider";
import { CodeguardianOrchestratorService } from "./codeguardian/codeguardian-orchestrator.service";
import { CodeguardianStaticAgentsService } from "./codeguardian/codeguardian-static-agents.service";
import { FastAPIAnalysisProvider } from "./fastapi-analysis.provider";
import { MockAnalysisProvider } from "./mock-analysis.provider";
import { OpenAiAnalysisProvider } from "./openai-analysis.provider";
import { QuickScanController } from "./quick-scan.controller";

@Module({
  imports: [ConfigModule],
  controllers: [QuickScanController],
  providers: [
    CodeguardianStaticAgentsService,
    CodeguardianOrchestratorService,
    MockAnalysisProvider,
    OpenAiAnalysisProvider,
    FastAPIAnalysisProvider,
    {
      provide: ANALYSIS_PROVIDER,
      inject: [
        ConfigService,
        MockAnalysisProvider,
        OpenAiAnalysisProvider,
        FastAPIAnalysisProvider,
      ],
      useFactory: (
        config: ConfigService,
        mock: MockAnalysisProvider,
        openai: OpenAiAnalysisProvider,
        fastapi: FastAPIAnalysisProvider,
      ) => {
        const mode = (
          config.get<string>("ANALYSIS_PROVIDER") ?? "fastapi"
        ).toLowerCase();
        if (mode === "openai") {
          return openai;
        }
        if (mode === "fastapi") {
          return fastapi;
        }
        return mock;
      },
    },
  ],
  exports: [
    ANALYSIS_PROVIDER,
    MockAnalysisProvider,
    OpenAiAnalysisProvider,
    FastAPIAnalysisProvider,
    CodeguardianOrchestratorService,
    CodeguardianStaticAgentsService,
  ],
})
export class AnalysisModule {}
