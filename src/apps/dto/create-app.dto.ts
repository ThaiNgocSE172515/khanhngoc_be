import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAppDto {
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

  @ApiPropertyOptional({
    description: 'Có thể truyền URL ảnh có sẵn hoặc để trống',
  })
  @IsString()
  @IsOptional()
  iconUrl?: string;
}