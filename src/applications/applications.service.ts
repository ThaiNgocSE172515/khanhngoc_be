import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';
import { PrismaService } from '../shared/prisma.service.js';
import { SupabaseService } from '../shared/supabase.service.js';
import {
  normalizePagination,
  PaginationQuery,
} from '../shared/pagination.helper.js';

export interface FindApplicationsQuery extends PaginationQuery {
  status?: string;
  q?: string;
}

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(
    createApplicationDto: CreateApplicationDto,
    file?: Express.Multer.File,
  ) {
    let cvUrl = createApplicationDto.cvUrl;

    if (file) {
      cvUrl = await this.supabaseService.uploadCv(file);
    }

    return this.prismaService.applications.create({
      data: {
        ...createApplicationDto,
        cvUrl,
      },
    });
  }

  private async attachSignedCvUrls<T extends { cvUrl: string | null }>(
    items: T[],
    concurrency = 5,
  ): Promise<T[]> {
    const result: T[] = new Array(items.length);
    let index = 0;

    const worker = async () => {
      while (index < items.length) {
        const currentIdx = index++;
        const item = items[currentIdx];
        result[currentIdx] = {
          ...item,
          cvUrl: item.cvUrl
            ? await this.supabaseService.getSignedCvUrl(item.cvUrl)
            : null,
        };
      }
    };

    const workers = Array.from(
      { length: Math.min(concurrency, items.length) },
      () => worker(),
    );
    await Promise.all(workers);
    return result;
  }

  async findAll(query?: FindApplicationsQuery) {
    const keyword = query?.q?.trim();
    const status = query?.status?.trim();

    const filters: Prisma.ApplicationsWhereInput[] = [];
    if (status && status !== 'ALL') {
      filters.push({ status });
    }
    if (keyword) {
      filters.push({
        OR: [
          { fullName: { contains: keyword, mode: 'insensitive' } },
          { email: { contains: keyword, mode: 'insensitive' } },
          { phone: { contains: keyword, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.ApplicationsWhereInput =
      filters.length > 0 ? { AND: filters } : {};
    const orderBy: Prisma.ApplicationsOrderByWithRelationInput = {
      created_at: 'desc',
    };
    const pagination = normalizePagination(query, 10, 100);

    if (!pagination.enabled) {
      const applications = await this.prismaService.applications.findMany({
        where,
        orderBy,
      });
      const data = await this.attachSignedCvUrls(applications);
      return {
        data,
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1,
      };
    }

    const [total, applications] = await Promise.all([
      this.prismaService.applications.count({ where }),
      this.prismaService.applications.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
      }),
    ]);

    const data = await this.attachSignedCvUrls(applications);

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
    };
  }

  async findOne(id: string) {
    const application = await this.prismaService.applications.findUnique({
      where: { id },
    });

    if (!application) return null;

    return {
      ...application,
      cvUrl: application.cvUrl
        ? await this.supabaseService.getSignedCvUrl(application.cvUrl)
        : null,
    };
  }

  update(id: string, updateApplicationDto: UpdateApplicationDto) {
    return this.prismaService.applications.update({
      data: {
        ...updateApplicationDto,
      },
      where: {
        id,
      },
    });
  }

  async remove(id: string) {
    const application = await this.prismaService.applications.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Không tìm thấy hồ sơ với ID: ${id}`);
    }

    if (application.cvUrl) {
      await this.supabaseService.deleteCv(application.cvUrl);
    }

    return this.prismaService.applications.delete({
      where: { id },
    });
  }
}
