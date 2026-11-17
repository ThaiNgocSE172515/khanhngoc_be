import { JobStatus } from '@prisma/client';

export class CreateHiringDto {
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
