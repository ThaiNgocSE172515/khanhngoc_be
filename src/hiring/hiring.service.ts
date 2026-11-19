import { Injectable } from '@nestjs/common';
import { Prisma, Job } from '@prisma/client';
import { CreateHiringDto } from './dto/create-hiring.dto.js';
import { UpdateHiringDto } from './dto/update-hiring.dto.js';
import { PrismaService } from '../shared/prisma.service.js';
import { normalizePagination, PaginationQuery } from '../shared/pagination.helper.js';

export interface FindJobsQuery extends PaginationQuery {
  lang?: 'vi' | 'en';
  q?: string;
  level?: string;
  location?: string;
}

@Injectable()
export class HiringService {
  constructor(private readonly prismaService: PrismaService) {}

  private localizeJob(job: Job, lang?: 'vi' | 'en') {
    if (lang !== 'en') return job;

    return {
      ...job,
      title: job.titleEn || job.title,
      locations: job.locationsEn || job.locations,
      quantity: job.quantityEn || job.quantity,
      salary: job.salaryEn || job.salary,
      level: job.levelEn || job.level,
      experience: job.experienceEn || job.experience,
      descriptionHtml: job.descriptionHtmlEn || job.descriptionHtml,
      requirementsHtml: job.requirementsHtmlEn || job.requirementsHtml,
      benefitsHtml: job.benefitsHtmlEn || job.benefitsHtml,
    };
  }

  create(createHiringDto: CreateHiringDto) {
    return this.prismaService.job.create({
      data: {
        ...createHiringDto,
      },
    });
  }

  async findAll(query?: FindJobsQuery) {
    const lang = query?.lang;
    const keyword = query?.q?.trim();
    const level = query?.level?.trim();
    const location = query?.location?.trim();

    const filters: Prisma.JobWhereInput[] = [];
    if (level && level !== 'ALL') {
      filters.push({
        OR: [
          { level: { equals: level, mode: 'insensitive' } },
          { levelEn: { equals: level, mode: 'insensitive' } },
        ],
      });
    }
    if (location && location !== 'ALL') {
      filters.push({
        OR: [
          { locations: { contains: location, mode: 'insensitive' } },
          { locationsEn: { contains: location, mode: 'insensitive' } },
        ],
      });
    }
    if (keyword) {
      filters.push({
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { titleEn: { contains: keyword, mode: 'insensitive' } },
          { locations: { contains: keyword, mode: 'insensitive' } },
          { locationsEn: { contains: keyword, mode: 'insensitive' } },
          { level: { contains: keyword, mode: 'insensitive' } },
          { levelEn: { contains: keyword, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.JobWhereInput = filters.length > 0 ? { AND: filters } : {};
    const orderBy: Prisma.JobOrderByWithRelationInput = { created_at: 'desc' };
    const pagination = normalizePagination(query, 10, 100);

    if (!pagination.enabled) {
      const rawData = await this.prismaService.job.findMany({ where, orderBy });
      const data = rawData.map((item) => this.localizeJob(item, lang));
      return {
        data,
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1,
      };
    }

    const [total, rawData] = await Promise.all([
      this.prismaService.job.count({ where }),
      this.prismaService.job.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
      }),
    ]);

    return {
      data: rawData.map((item) => this.localizeJob(item, lang)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
    };
  }

  async findOne(id: string, lang?: 'vi' | 'en') {
    const job = await this.prismaService.job.findUnique({
      where: {
        job_id: id,
      },
    });
    if (!job) return null;
    return this.localizeJob(job, lang);
  }

  update(id: string, updateHiringDto: UpdateHiringDto) {
    return this.prismaService.job.update({
      data: {
        ...updateHiringDto,
      },
      where: {
        job_id: id,
      },
    });
  }

  remove(id: string) {
    return this.prismaService.job.delete({
      where: {
        job_id: id,
      },
    });
  }
}