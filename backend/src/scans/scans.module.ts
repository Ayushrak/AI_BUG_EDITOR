import { Module } from '@nestjs/common';
import { AnalysisModule } from '../analysis/analysis.module';
import { IngestionService } from './ingestion.service';
import { ScansController } from './scans.controller';
import { ScansService } from './scans.service';

@Module({
  imports: [AnalysisModule],
  controllers: [ScansController],
  providers: [ScansService, IngestionService],
  exports: [ScansService],
  
})
export class ScansModule {}
