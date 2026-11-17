import { PartialType } from '@nestjs/mapped-types';
import { CreateHiringDto } from './create-hiring.dto.js';
import { JobStatus } from '@prisma/client';

export class UpdateHiringDto extends PartialType(CreateHiringDto) {
  title: string;
  locations: string;
  quantity: string;
  salary: string;
  level: string;
  experience: string;
  descriptionHtml: string;
  requirementsHtml: string;
  benefitsHtml: string;
}
