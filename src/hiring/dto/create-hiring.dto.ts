import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHiringDto {
  @ApiProperty({ example: 'Kỹ sư BIM / Revit', description: 'Chức danh tuyển dụng' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'TP. Hồ Chí Minh', description: 'Địa điểm làm việc' })
  @IsString()
  @IsNotEmpty()
  locations: string;

  @ApiProperty({ example: '2 người', description: 'Số lượng tuyển' })
  @IsString()
  @IsNotEmpty()
  quantity: string;

  @ApiProperty({ example: '15 - 25 triệu', description: 'Mức lương' })
  @IsString()
  @IsNotEmpty()
  salary: string;

  @ApiProperty({ example: 'Junior / Middle', description: 'Cấp bậc' })
  @IsString()
  @IsNotEmpty()
  level: string;

  @ApiProperty({ example: '1 - 3 năm', description: 'Kinh nghiệm' })
  @IsString()
  @IsNotEmpty()
  experience: string;

  @ApiProperty({ example: '<p>Mô tả công việc...</p>', description: 'HTML mô tả công việc' })
  @IsString()
  @IsNotEmpty()
  descriptionHtml: string;

  @ApiProperty({ example: '<p>Yêu cầu ứng viên...</p>', description: 'HTML yêu cầu' })
  @IsString()
  @IsNotEmpty()
  requirementsHtml: string;

  @ApiProperty({ example: '<p>Quyền lợi...</p>', description: 'HTML quyền lợi' })
  @IsString()
  @IsNotEmpty()
  benefitsHtml: string;
}

