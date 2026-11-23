// src/projects/dto/create-project.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nameEn?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  investor: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  investorEn?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  projectType: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  projectTypeEn?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  completionTime: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  completionTimeEn?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  locationEn?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  area: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  areaEn?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  revitLink?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lat?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lng?: string;

  @ApiPropertyOptional({
    description: 'Danh sách URL ảnh chính đã upload lên R2 (mảng hoặc JSON string)',
  })
  @IsOptional()
  mainImages?: string[] | string;

  @ApiPropertyOptional({
    description: 'Danh sách URL ảnh phụ đã upload lên R2 (mảng hoặc JSON string)',
  })
  @IsOptional()
  images?: string[] | string;
}