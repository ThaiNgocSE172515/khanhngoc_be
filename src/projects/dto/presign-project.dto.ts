import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PresignProjectDto {
  @ApiProperty({ example: 'cover.jpg', description: 'Tên file ảnh gốc' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiPropertyOptional({
    example: 'image/jpeg',
    description: 'MIME type của ảnh',
  })
  @IsString()
  @IsOptional()
  contentType?: string;

  @ApiPropertyOptional({
    example: 'projects/main',
    enum: ['projects/main', 'projects/gallery'],
    description: 'Thư mục lưu trên R2',
  })
  @IsOptional()
  @IsIn(['projects/main', 'projects/gallery'])
  folder?: 'projects/main' | 'projects/gallery';
}