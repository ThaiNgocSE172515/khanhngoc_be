import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHiringDto {
  @ApiProperty({ example: 'Kỹ sư BIM / Revit', description: 'Chức danh tuyển dụng (VI)' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'BIM / Revit Engineer', description: 'Chức danh tuyển dụng (EN)' })
  @IsString()
  @IsOptional()
  titleEn?: string;

  @ApiProperty({ example: 'TP. Hồ Chí Minh', description: 'Địa điểm làm việc (VI)' })
  @IsString()
  @IsNotEmpty()
  locations: string;

  @ApiPropertyOptional({ example: 'Ho Chi Minh City', description: 'Địa điểm làm việc (EN)' })
  @IsString()
  @IsOptional()
  locationsEn?: string;

  @ApiProperty({ example: '2 người', description: 'Số lượng tuyển (VI)' })
  @IsString()
  @IsNotEmpty()
  quantity: string;

  @ApiPropertyOptional({ example: '2 positions', description: 'Số lượng tuyển (EN)' })
  @IsString()
  @IsOptional()
  quantityEn?: string;

  @ApiProperty({ example: '15 - 25 triệu', description: 'Mức lương (VI)' })
  @IsString()
  @IsNotEmpty()
  salary: string;

  @ApiPropertyOptional({ example: '$600 - $1,000', description: 'Mức lương (EN)' })
  @IsString()
  @IsOptional()
  salaryEn?: string;

  @ApiProperty({ example: 'Junior / Middle', description: 'Cấp bậc (VI)' })
  @IsString()
  @IsNotEmpty()
  level: string;

  @ApiPropertyOptional({ example: 'Junior / Middle', description: 'Cấp bậc (EN)' })
  @IsString()
  @IsOptional()
  levelEn?: string;

  @ApiProperty({ example: '1 - 3 năm', description: 'Kinh nghiệm (VI)' })
  @IsString()
  @IsNotEmpty()
  experience: string;

  @ApiPropertyOptional({ example: '1 - 3 years', description: 'Kinh nghiệm (EN)' })
  @IsString()
  @IsOptional()
  experienceEn?: string;

  @ApiProperty({ example: '<p>Mô tả công việc...</p>', description: 'HTML mô tả công việc (VI)' })
  @IsString()
  @IsNotEmpty()
  descriptionHtml: string;

  @ApiPropertyOptional({ example: '<p>Job description...</p>', description: 'HTML mô tả công việc (EN)' })
  @IsString()
  @IsOptional()
  descriptionHtmlEn?: string;

  @ApiProperty({ example: '<p>Yêu cầu ứng viên...</p>', description: 'HTML yêu cầu (VI)' })
  @IsString()
  @IsNotEmpty()
  requirementsHtml: string;

  @ApiPropertyOptional({ example: '<p>Requirements...</p>', description: 'HTML yêu cầu (EN)' })
  @IsString()
  @IsOptional()
  requirementsHtmlEn?: string;

  @ApiProperty({ example: '<p>Quyền lợi...</p>', description: 'HTML quyền lợi (VI)' })
  @IsString()
  @IsNotEmpty()
  benefitsHtml: string;

  @ApiPropertyOptional({ example: '<p>Benefits...</p>', description: 'HTML quyền lợi (EN)' })
  @IsString()
  @IsOptional()
  benefitsHtmlEn?: string;
}