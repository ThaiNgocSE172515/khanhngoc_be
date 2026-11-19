import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto.js';

export class FindProjectsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: '1', description: 'Trang hiện tại' })
  declare page?: number;

  @ApiPropertyOptional({ example: '9', description: 'Số lượng mỗi trang' })
  declare limit?: number;

  @ApiPropertyOptional({ example: 'vi', enum: ['vi', 'en'], description: 'Ngôn ngữ trả về' })
  @IsOptional()
  @IsIn(['vi', 'en'])
  lang?: 'vi' | 'en';

  @ApiPropertyOptional({ example: 'Khu đô thị', description: 'Lọc theo loại dự án' })
  @IsOptional()
  @IsString()
  projectType?: string;

  @ApiPropertyOptional({ example: 'Khu đô thị', description: 'Alias của projectType' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'ABC', description: 'Lọc theo chủ đầu tư' })
  @IsOptional()
  @IsString()
  investor?: string;

  @ApiPropertyOptional({ example: '2026', description: 'Lọc theo thời gian hoàn thành' })
  @IsOptional()
  @IsString()
  completionTime?: string;

  @ApiPropertyOptional({ example: 'Vĩnh Long', description: 'Từ khóa tìm kiếm' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 'Vĩnh Long', description: 'Alias của q' })
  @IsOptional()
  @IsString()
  search?: string;
}