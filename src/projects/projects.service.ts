import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service.js';
import { SupabaseService } from '../shared/supabase.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { normalizePagination } from '../shared/pagination.helper.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(
    body: CreateProjectDto,
    files: {
      mainImages?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    const mainFiles = files?.mainImages || [];
    const subFiles = files?.images || [];

    if (mainFiles.length === 0) {
      throw new BadRequestException('Vui lòng tải lên ít nhất 1 ảnh chính');
    }
    if (mainFiles.length > 3 || subFiles.length > 15) {
      throw new BadRequestException(
        'Ảnh chính tối đa 3 hình và ảnh phụ tối đa 15 hình',
      );
    }

    const mainImageUrls = await Promise.all(
      mainFiles.map((file) =>
        this.supabaseService.uploadProjectImage(file, 'main'),
      ),
    );

    const subImageUrls = await Promise.all(
      subFiles.map((file) =>
        this.supabaseService.uploadProjectImage(file, 'gallery'),
      ),
    );

    return this.prisma.project.create({
      data: {
        name: body.name,
        investor: body.investor,
        projectType: body.projectType,
        completionTime: body.completionTime,
        location: body.location,
        description: body.description || '',
        area: body.area,
        revitLink: body.revitLink || null,
        lat: body.lat || null,
        lng: body.lng || null,
        mainImages: mainImageUrls,
        images: subImageUrls,
      },
    });
  }

  async findAll(query?: {
    projectType?: string;
    investor?: string;
    completionTime?: string;
    q?: string;
    page?: number | string;
    limit?: number | string;
  }) {
    const { projectType, investor, completionTime, q } = query || {};
    const keyword = q?.trim();

    const filters: Prisma.ProjectWhereInput[] = [];
    if (projectType && projectType !== 'ALL') {
      filters.push({ projectType });
    }
    if (investor && investor !== 'ALL') {
      filters.push({ investor });
    }
    if (completionTime && completionTime !== 'ALL') {
      filters.push({ completionTime });
    }
    if (keyword) {
      filters.push({
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { location: { contains: keyword, mode: 'insensitive' } },
          { investor: { contains: keyword, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.ProjectWhereInput =
      filters.length > 0 ? { AND: filters } : {};
    const orderBy: Prisma.ProjectOrderByWithRelationInput = {
      created_at: 'desc',
    };
    const pagination = normalizePagination(query, 9, 100);

    const [groupedTypes, groupedInvestors, groupedCompletions] =
      await Promise.all([
        this.prisma.project.groupBy({
          by: ['projectType'],
          where: { projectType: { not: '' } },
        }),
        this.prisma.project.groupBy({
          by: ['investor'],
          where: { investor: { not: '' } },
        }),
        this.prisma.project.groupBy({
          by: ['completionTime'],
          where: { completionTime: { not: '' } },
        }),
      ]);

    const filterOptions = {
      projectTypes: groupedTypes.map((i) => i.projectType).filter(Boolean),
      investors: groupedInvestors.map((i) => i.investor).filter(Boolean),
      completionTimes: groupedCompletions
        .map((i) => i.completionTime)
        .filter(Boolean),
    };

    if (!pagination.enabled) {
      const items = await this.prisma.project.findMany({ where, orderBy });
      return {
        data: items,
        total: items.length,
        page: 1,
        limit: items.length,
        totalPages: 1,
        filters: filterOptions,
      };
    }

    const [total, items] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
      }),
    ]);

    return {
      data: items,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
      filters: filterOptions,
    };
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Không tìm thấy dự án');
    return project;
  }

  async update(
    id: string,
    body: UpdateProjectDto,
    files: {
      mainImages?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    const existing = await this.findOne(id);
    const filesToDelete: string[] = [];

    // 1. Xử lý tối đa 3 ảnh chính
    let keptMainImages: string[] = existing.mainImages || [];
    if (body.existingMainImages !== undefined) {
      try {
        keptMainImages = JSON.parse(body.existingMainImages);
      } catch {
        keptMainImages = [];
      }
      const removedMain = (existing.mainImages || []).filter(
        (url) => !keptMainImages.includes(url),
      );
      filesToDelete.push(...removedMain);
    }

    const newMainFiles = files?.mainImages || [];
    if (keptMainImages.length + newMainFiles.length > 3) {
      throw new BadRequestException('Ảnh chính tối đa 3 hình');
    }

    const newMainUrls = await Promise.all(
      newMainFiles.map((file) =>
        this.supabaseService.uploadProjectImage(file, 'main'),
      ),
    );
    const finalMainImages = [...keptMainImages, ...newMainUrls];
    if (finalMainImages.length === 0) {
      throw new BadRequestException('Dự án phải có ít nhất 1 ảnh chính');
    }

    // 2. Xử lý tối đa 15 ảnh phụ
    let keptSubImages: string[] = existing.images || [];
    if (body.existingImages !== undefined) {
      try {
        keptSubImages = JSON.parse(body.existingImages);
      } catch {
        keptSubImages = [];
      }
      const removedSub = (existing.images || []).filter(
        (url) => !keptSubImages.includes(url),
      );
      filesToDelete.push(...removedSub);
    }

    const newSubFiles = files?.images || [];
    if (keptSubImages.length + newSubFiles.length > 15) {
      throw new BadRequestException('Ảnh phụ tối đa 15 hình');
    }

    const newSubUrls = await Promise.all(
      newSubFiles.map((file) =>
        this.supabaseService.uploadProjectImage(file, 'gallery'),
      ),
    );

    if (filesToDelete.length > 0) {
      await this.supabaseService.deleteProjectFiles(filesToDelete);
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.investor !== undefined && { investor: body.investor }),
        ...(body.projectType !== undefined && {
          projectType: body.projectType,
        }),
        ...(body.completionTime !== undefined && {
          completionTime: body.completionTime,
        }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.area !== undefined && { area: body.area }),
        mainImages: finalMainImages,
        images: [...keptSubImages, ...newSubUrls],
        ...(body.revitLink !== undefined && {
          revitLink: body.revitLink || null,
        }),
        ...(body.lat !== undefined && {
          lat: body.lat || null,
        }),
        ...(body.lng !== undefined && {
          lng: body.lng || null,
        }),
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    await this.supabaseService.deleteProjectFiles([
      ...(existing.mainImages || []),
      ...(existing.images || []),
    ]);
    return this.prisma.project.delete({ where: { id } });
  }
}