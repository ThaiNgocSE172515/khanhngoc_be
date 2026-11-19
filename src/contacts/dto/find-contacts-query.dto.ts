import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto.js';

export class FindContactsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: '1', description: 'Trang hiện tại' })
  declare page?: number;

  @ApiPropertyOptional({ example: '10', description: 'Số lượng mỗi trang' })
  declare limit?: number;

  @ApiPropertyOptional({ example: 'CONTACT', description: 'Lọc theo loại: CONTACT hoặc PROFILE' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'pending', description: 'Lọc theo trạng thái' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A', description: 'Từ khóa tìm kiếm tên/email/SĐT/công ty' })
  @IsOptional()
  @IsString()
  q?: string;
}
