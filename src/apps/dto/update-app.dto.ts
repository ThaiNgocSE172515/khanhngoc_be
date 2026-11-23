import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateAppDto } from './create-app.dto.js';

export class UpdateAppDto extends PartialType(CreateAppDto) {
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  removeIcon?: boolean;
}