import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../shared/dto/pagination-query.dto.js";

export class FindMembersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: '1', description: 'Trang hiện tại' })
  declare page?: number;

  @ApiPropertyOptional({ example: '12', description: 'Số lượng mỗi trang' })
  declare limit?: number;

  @ApiPropertyOptional({ example: 'Giám đốc', description: 'Tìm theo tên hoặc chức vụ' })
  @IsOptional()
  @IsString()
  search?: string;
}