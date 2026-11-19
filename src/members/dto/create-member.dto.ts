import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto.js';

export class CreateMemberDto {
  @ApiProperty({ example: 'Trần Minh B', description: 'Tên thành viên' })
  @IsNotEmpty({ message: 'Vui lòng nhập tên thành viên' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Giám đốc thiết kế', description: 'Chức vụ' })
  @IsNotEmpty({ message: 'Vui lòng nhập chức vụ' })
  @IsString()
  position: string;

  @ApiPropertyOptional({ example: 'Hơn 10 năm kinh nghiệm...', description: 'Câu chuyện / tiểu sử' })
  @IsOptional()
  @IsString()
  story?: string;
}