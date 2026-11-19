import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Dự án Khu đô thị X', description: 'Tên dự án' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Công ty Cổ phần ABC', description: 'Chủ đầu tư' })
  @IsString()
  @IsNotEmpty()
  investor: string;

  @ApiProperty({ example: 'Khu đô thị', description: 'Loại dự án' })
  @IsString()
  @IsNotEmpty()
  projectType: string;

  @ApiProperty({ example: '2026', description: 'Thời gian hoàn thành' })
  @IsString()
  @IsNotEmpty()
  completionTime: string;

  @ApiProperty({ example: 'Vĩnh Long', description: 'Địa điểm' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({
    example: 'Mô tả chi tiết dự án',
    description: 'Mô tả',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '12.5 ha', description: 'Diện tích' })
  @IsString()
  @IsNotEmpty()
  area: string;

  @ApiPropertyOptional({
    example: 'https://...',
    description: 'Link mô hình Revit',
  })
  @IsString()
  @IsOptional()
  revitLink?: string;

  @ApiPropertyOptional({
    example: '10.2537',
    description: 'Vĩ độ (Latitude)',
  })
  @IsString()
  @IsOptional()
  lat?: string;

  @ApiPropertyOptional({
    example: '105.9722',
    description: 'Kinh độ (Longitude)',
  })
  @IsString()
  @IsOptional()
  lng?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Danh sách URL ảnh chính',
  })
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
