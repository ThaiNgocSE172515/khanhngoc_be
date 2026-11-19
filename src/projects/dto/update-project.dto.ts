import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateProjectDto } from './create-project.dto.js';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({
    type: [String],
    description: 'JSON string danh sách URL ảnh chính giữ lại',
  })
  @IsOptional()
  @IsString()
  existingMainImages?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'JSON string danh sách URL ảnh phụ giữ lại',
  })
  @IsOptional()
  @IsString()
  existingImages?: string;
}