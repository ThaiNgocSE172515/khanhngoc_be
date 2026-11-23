import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CreateAppDto } from './create-app.dto.js';

export class UpdateAppDto extends PartialType(
  OmitType(CreateAppDto, ['iconUrl'] as const),
) {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  iconUrl?: string | null;
 
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  removeIcon?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  fileSize?: number;
}
