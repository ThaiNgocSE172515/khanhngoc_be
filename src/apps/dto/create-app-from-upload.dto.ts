// dto/create-app-from-upload.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAppFromUploadDto {
  @ApiProperty({ example: 'Phần mềm Quản lý Kho v2.1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '2.1.0' })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiPropertyOptional({ example: 'Windows / Android' })
  @IsString()
  @IsOptional()
  platform?: string;

  @ApiPropertyOptional({ example: 'Bản cập nhật hỗ trợ xuất báo cáo nhanh' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  iconUrl?: string | null;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ example: 42876108 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  fileSize: number;
}