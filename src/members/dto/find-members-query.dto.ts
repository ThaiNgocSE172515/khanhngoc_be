import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto.js';

export class FindMembersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: '1', description: 'Trang hiện tại' })
  declare page?: number;

  @ApiPropertyOptional({ example: '12', description: 'Số lượng mỗi trang' })
  declare limit?: number;

  @ApiPropertyOptional({ example: 'vi', enum: ['vi', 'en'], description: 'Ngôn ngữ trả về' })
  @IsOptional()
  @IsIn(['vi', 'en'])
  lang?: 'vi' | 'en';

  @ApiPropertyOptional({ example: 'Giám đốc', description: 'Tìm theo tên hoặc chức vụ' })
  @IsOptional()
  @IsString()
  search?: string;
}