import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  investor: string;

  @IsString()
  @IsNotEmpty()
  projectType: string;

  @IsString()
  @IsNotEmpty()
  completionTime: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  area: string;

  @IsString()
  @IsOptional()
  revitLink?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mainImages: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
