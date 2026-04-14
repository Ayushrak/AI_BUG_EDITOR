import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ANALYSIS_PROVIDER,
  AnalysisProvider,
} from '../analysis/analysis.provider';
import { AnalysisResult } from '../analysis/analysis.types';
import { CreateScanDto } from './dto/create-scan.dto';
import { IngestionService } from './ingestion.service';

export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ScanRecord {
  id: string;
  status: ScanStatus;
  createdAt: string;
  updatedAt: string;
  inputSummary: {
    files: { path: string; lines: number }[];
    businessRequirements?: boolean;
    analysisModes?: string[];
  };
  result?: AnalysisResult;
  error?: { message: string };
}

@Injectable()
export class ScansService {
  private readonly scans = new Map<string, ScanRecord>();

  constructor(
    private readonly ingestion: IngestionService,
    @Inject(ANALYSIS_PROVIDER) private readonly analysis: AnalysisProvider,
  ) {}

  create(dto: CreateScanDto): { id: string; status: ScanStatus; createdAt: string } {
    this.ingestion.validate(dto.files);
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const record: ScanRecord = {
      id,
      status: 'pending',
      createdAt,
      updatedAt: createdAt,
      inputSummary: {
        files: dto.files.map((f) => ({
          path: f.path,
          lines: f.content.split('\n').length,
        })),
        businessRequirements: Boolean(dto.businessRequirements?.trim()),
        analysisModes: dto.analysisModes,
      },
    };
    this.scans.set(id, record);
    void this.runAnalysis(id, dto);
    return { id, status: 'pending', createdAt };
  }

  get(id: string): ScanRecord {
    const r = this.scans.get(id);
    if (!r) {
      throw new NotFoundException(`Scan ${id} not found`);
    }
    return r;
  }

  list(limit = 50): ScanRecord[] {
    return [...this.scans.values()]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, limit);
  }

  private async runAnalysis(id: string, dto: CreateScanDto): Promise<void> {
    const record = this.scans.get(id);
    if (!record) {
      return;
    }
    record.status = 'running';
    record.updatedAt = new Date().toISOString();
    try {
      const result = await this.analysis.analyze({
        files: dto.files.map((f) => ({ path: f.path, content: f.content })),
        businessRequirements: dto.businessRequirements,
        requirements: dto.businessRequirements,
        analysisModes: dto.analysisModes,
      });
      record.status = 'completed';
      record.result = result;
    } catch (err) {
      record.status = 'failed';
      record.error = {
        message: err instanceof Error ? err.message : 'Analysis failed',
      };
    }
    record.updatedAt = new Date().toISOString();
  }
}
