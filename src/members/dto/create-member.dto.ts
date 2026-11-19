import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({ example: 'Trần Minh B', description: 'Tên thành viên (VI)' })
  @IsNotEmpty({ message: 'Vui lòng nhập tên thành viên' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Tran Minh B', description: 'Tên thành viên (EN)' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiProperty({ example: 'leader', description: 'Chức vụ (VI)' })
  @IsNotEmpty({ message: 'Vui lòng nhập chức vụ' })
  @IsString()
  position: string;

  @ApiPropertyOptional({ example: 'Team Leader', description: 'Chức vụ (EN)' })
  @IsOptional()
  @IsString()
  positionEn?: string;

  @ApiPropertyOptional({ example: 'Hơn 10 năm kinh nghiệm...', description: 'Câu chuyện / tiểu sử (VI)' })
  @IsOptional()
  @IsString()
  story?: string;

  @ApiPropertyOptional({ example: 'Over 10 years of experience...', description: 'Câu chuyện / tiểu sử (EN)' })
  @IsOptional()
  @IsString()
  storyEn?: string;
}