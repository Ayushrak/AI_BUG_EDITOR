import { IsOptional, IsString, MinLength } from 'class-validator';

export class QuickScanDto {
  @IsString()
  @MinLength(1)
  code: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsString()
  requirements?: string;
}
