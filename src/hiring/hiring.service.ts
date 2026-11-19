import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateHiringDto } from './dto/create-hiring.dto.js';
import { UpdateHiringDto } from './dto/update-hiring.dto.js';
import { PrismaService } from '../shared/prisma.service.js';
import { normalizePagination, PaginationQuery } from '../shared/pagination.helper.js';

export interface FindJobsQuery extends PaginationQuery {
  q?: string;
  level?: string;
  location?: string;
}

@Injectable()
export class HiringService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createHiringDto: CreateHiringDto) {
    return this.prismaService.job.create({
      data: {
        ...createHiringDto,
      },
    });
  }

  async findAll(query?: FindJobsQuery) {
    const keyword = query?.q?.trim();
    const level = query?.level?.trim();
    const location = query?.location?.trim();

    const filters: Prisma.JobWhereInput[] = [];
    if (level && level !== 'ALL') {
      filters.push({ level: { equals: level, mode: 'insensitive' } });
    }
    if (location && location !== 'ALL') {
      filters.push({ locations: { contains: location, mode: 'insensitive' } });
    }
    if (keyword) {
      filters.push({
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { locations: { contains: keyword, mode: 'insensitive' } },
          { level: { contains: keyword, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.JobWhereInput = filters.length > 0 ? { AND: filters } : {};
    const orderBy: Prisma.JobOrderByWithRelationInput = { created_at: 'desc' };
    const pagination = normalizePagination(query, 10, 100);

    if (!pagination.enabled) {
      const data = await this.prismaService.job.findMany({ where, orderBy });
      return {
        data,
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1,
      };
    }

    const [total, data] = await Promise.all([
      this.prismaService.job.count({ where }),
      this.prismaService.job.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
      }),
    ]);

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
    };
  }

  findOne(id: string) {
    return this.prismaService.job.findUnique({
      where: {
        job_id: id,
      },
    });
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