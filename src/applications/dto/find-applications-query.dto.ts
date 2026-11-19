import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto.js';

export class FindApplicationsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: '1', description: 'Trang hiện tại' })
  declare page?: number;

  @ApiPropertyOptional({ example: '10', description: 'Số lượng mỗi trang' })
  declare limit?: number;

  @ApiPropertyOptional({ example: 'WAITING', description: 'Lọc theo trạng thái' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A', description: 'Từ khóa tìm kiếm tên/email/SĐT' })
  @IsOptional()
  @IsString()
  q?: string;
}