// src/projects/dto/update-project.dto.ts
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateProjectDto } from './create-project.dto.js';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional()
  @IsOptional()
  existingMainImages?: string[] | string;

  @ApiPropertyOptional()
  @IsOptional()
  existingImages?: string[] | string;
}