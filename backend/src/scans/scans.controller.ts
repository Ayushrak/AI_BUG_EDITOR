import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateScanDto } from './dto/create-scan.dto';
import { ScansService } from './scans.service';

@Controller('scans')
export class ScansController {
  constructor(private readonly scans: ScansService) {}

  @Post()
  create(@Body() dto: CreateScanDto) {
    return this.scans.create(dto);
  }

  @Get()
  list(@Query('limit') limit?: string) {
    const n = limit ? Number(limit) : 50;
    return this.scans.list(Number.isFinite(n) ? Math.min(100, Math.max(1, n)) : 50);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.scans.get(id);
  }
}
