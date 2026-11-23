// dto/presign-app.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PresignAppDto {
  @ApiProperty({ example: 'MEP ENG.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiPropertyOptional({ example: 'application/pdf' })
  @IsString()
  @IsOptional()
  contentType?: string;

  @ApiPropertyOptional({ enum: ['apps', 'app-icons'], example: 'apps' })
  @IsOptional()
  @IsIn(['apps', 'app-icons'])
  folder?: 'apps' | 'app-icons';
}