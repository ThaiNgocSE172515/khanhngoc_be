import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Dự án Khu đô thị X', description: 'Tên dự án (VI)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Urban Area X Project', description: 'Tên dự án (EN)' })
  @IsString()
  @IsOptional()
  nameEn?: string;

  @ApiProperty({ example: 'Công ty Cổ phần ABC', description: 'Chủ đầu tư (VI)' })
  @IsString()
  @IsNotEmpty()
  investor: string;

  @ApiPropertyOptional({ example: 'ABC Joint Stock Company', description: 'Chủ đầu tư (EN)' })
  @IsString()
  @IsOptional()
  investorEn?: string;

  @ApiProperty({ example: 'Khu đô thị', description: 'Loại dự án (VI)' })
  @IsString()
  @IsNotEmpty()
  projectType: string;

  @ApiPropertyOptional({ example: 'Urban Area', description: 'Loại dự án (EN)' })
  @IsString()
  @IsOptional()
  projectTypeEn?: string;

  @ApiProperty({ example: '2026', description: 'Thời gian hoàn thành (VI)' })
  @IsString()
  @IsNotEmpty()
  completionTime: string;

  @ApiPropertyOptional({ example: '2026', description: 'Thời gian hoàn thành (EN)' })
  @IsString()
  @IsOptional()
  completionTimeEn?: string;

  @ApiProperty({ example: 'Vĩnh Long', description: 'Địa điểm (VI)' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ example: 'Vinh Long, Vietnam', description: 'Địa điểm (EN)' })
  @IsString()
  @IsOptional()
  locationEn?: string;

  @ApiPropertyOptional({ example: 'Mô tả chi tiết dự án', description: 'Mô tả (VI)' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Detailed project description', description: 'Mô tả (EN)' })
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiProperty({ example: '12.5 ha', description: 'Diện tích (VI)' })
  @IsString()
  @IsNotEmpty()
  area: string;

  @ApiPropertyOptional({ example: '12.5 ha', description: 'Diện tích (EN)' })
  @IsString()
  @IsOptional()
  areaEn?: string;

  @ApiPropertyOptional({ example: 'https://...', description: 'Link mô hình Revit' })
  @IsString()
  @IsOptional()
  revitLink?: string;

  @ApiPropertyOptional({ example: '10.2537', description: 'Vĩ độ (Latitude)' })
  @IsString()
  @IsOptional()
  lat?: string;

  @ApiPropertyOptional({ example: '105.9722', description: 'Kinh độ (Longitude)' })
  @IsString()
  @IsOptional()
  lng?: string;

  @ApiPropertyOptional({ type: [String], description: 'Danh sách URL ảnh chính' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mainImages?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Danh sách URL ảnh phụ' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}