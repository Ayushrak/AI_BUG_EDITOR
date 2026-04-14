import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScanFileDto } from './dto/create-scan.dto';

@Injectable()
export class IngestionService {
  constructor(private readonly config: ConfigService) {}

  validate(files: ScanFileDto[]): void {
    const maxFiles = Number(this.config.get('MAX_FILES')) || 20;
    const maxTotalLines = Number(this.config.get('MAX_TOTAL_LINES')) || 50_000;
    const maxFileBytes = Number(this.config.get('MAX_FILE_BYTES')) || 750_000;

    if (files.length > maxFiles) {
      throw new BadRequestException(`Too many files (max ${maxFiles})`);
    }

    let totalLines = 0;
    for (const f of files) {
      const bytes = Buffer.byteLength(f.content, 'utf8');
      if (bytes > maxFileBytes) {
        throw new BadRequestException(
          `File "${f.path}" exceeds max size (${maxFileBytes} bytes)`,
        );
      }
      totalLines += f.content.split('\n').length;
    }
    if (totalLines > maxTotalLines) {
      throw new BadRequestException(
        `Total lines ${totalLines} exceed limit (${maxTotalLines})`,
      );
    }
  }
}
