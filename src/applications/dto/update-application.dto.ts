import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationDto } from './create-application.dto.js';
import { IsOptional, IsString } from 'class-validator';

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {
  @IsOptional()
  @IsString()
  status?: string;
}