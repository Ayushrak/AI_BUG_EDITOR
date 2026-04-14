import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ScanFileDto {
  @IsString()
  @MaxLength(512)
  path: string;

  @IsString()
  @MaxLength(2_000_000)
  content: string;
}

export class CreateScanDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ScanFileDto)
  files: ScanFileDto[];

  @IsOptional()
  @IsString()
  @MaxLength(32_000)
  businessRequirements?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  analysisModes?: string[];
}
