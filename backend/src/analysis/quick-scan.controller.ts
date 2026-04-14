import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { QuickScanDto } from './dto/quick-scan.dto';
import { CodeguardianOrchestratorService } from './codeguardian/codeguardian-orchestrator.service';

/**
 * Drop-in compatibility with Asset-Manager / CodeGuardian Express route:
 * POST /api/scan → here POST /api/v1/scan (same JSON body/response shape).
 */
@Controller('scan')
export class QuickScanController {
  constructor(private readonly orchestrator: CodeguardianOrchestratorService) {}

  @Post()
  @HttpCode(200)
  run(@Body() body: QuickScanDto) {
    const lang = (body.language ?? 'javascript').toLowerCase();
    const ext =
      lang === 'typescript' || lang === 'ts'
        ? 'ts'
        : lang === 'python' || lang === 'py'
          ? 'py'
          : 'txt';
    const path = body.filename?.trim() || `snippet.${ext}`;
    const { legacy } = this.orchestrator.analyze({
      files: [{ path, content: body.code }],
      requirements: body.requirements,
      businessRequirements: body.requirements,
      language: body.language,
    });
    return legacy;
  }
}
