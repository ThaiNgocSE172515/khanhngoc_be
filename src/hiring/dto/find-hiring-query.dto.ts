import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto.js';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class FindHiringQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: '1', description: 'Trang hiện tại' })
  declare page?: number;

  @ApiPropertyOptional({ example: '10', description: 'Số lượng mỗi trang' })
  declare limit?: number;

  @ApiPropertyOptional({ example: 'vi', enum: ['vi', 'en'], description: 'Ngôn ngữ trả về' })
  @IsOptional()
  @IsIn(['vi', 'en'])
  lang?: 'vi' | 'en';

  @ApiPropertyOptional({ example: 'BIM', description: 'Từ khóa tìm kiếm' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 'Senior', description: 'Lọc theo cấp bậc' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ example: 'Hồ Chí Minh', description: 'Lọc theo địa điểm' })
  @IsOptional()
  @IsString()
  location?: string;
}