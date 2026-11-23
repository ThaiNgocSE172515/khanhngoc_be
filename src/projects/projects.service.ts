import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Project } from '@prisma/client';
import { PrismaService } from '../shared/prisma.service.js';
import { R2Service } from '../shared/r2.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { PresignProjectDto } from './dto/presign-project.dto.js';
import { normalizePagination } from '../shared/pagination.helper.js';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  async createPresignedUploadUrl(body: PresignProjectDto) {
    return this.r2Service.createPresignedUploadUrl({
      fileName: body.fileName,
      contentType: body.contentType || 'image/jpeg',
      folder: body.folder || 'projects/gallery',
    });
  }

  private localizeProject(project: Project, lang?: 'vi' | 'en') {
    if (lang !== 'en') return project;

    return {
      ...project,
      name: project.nameEn || project.name,
      investor: project.investorEn || project.investor,
      projectType: project.projectTypeEn || project.projectType,
      completionTime: project.completionTimeEn || project.completionTime,
      location: project.locationEn || project.location,
      description: project.descriptionEn || project.description,
      area: project.areaEn || project.area,
    };
  }

  private parseStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter(
        (item): item is string =>
          typeof item === 'string' && item.trim().length > 0,
      );
    }
    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item): item is string =>
              typeof item === 'string' && item.trim().length > 0,
          );
        }
      } catch {
        return [];
      }
    }
    return [];
  }

  async create(
    body: CreateProjectDto,
    files?: {
      mainImages?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    const mainFiles = files?.mainImages || [];
    const subFiles = files?.images || [];
    const bodyMainUrls = this.parseStringArray(body.mainImages);
    const bodySubUrls = this.parseStringArray(body.images);

    const totalMain = mainFiles.length + bodyMainUrls.length;
    const totalSub = subFiles.length + bodySubUrls.length;

    if (totalMain === 0) {
      throw new BadRequestException('Vui lòng tải lên ít nhất 1 ảnh chính');
    }
    if (totalMain > 3 || totalSub > 15) {
      throw new BadRequestException(
        'Ảnh chính tối đa 3 hình và ảnh phụ tối đa 15 hình',
      );
    }

    const uploadedMainUrls = await Promise.all(
      mainFiles.map(async (file) => {
        const uploaded = await this.r2Service.uploadImage(
          file,
          'projects/main',
        );
        return uploaded.url;
      }),
    );

    const uploadedSubUrls = await Promise.all(
      subFiles.map(async (file) => {
        const uploaded = await this.r2Service.uploadImage(
          file,
          'projects/gallery',
        );
        return uploaded.url;
      }),
    );

    const minOrderAgg = await this.prisma.project.aggregate({
      _min: { sortOrder: true },
    });
    const nextSortOrder = (minOrderAgg._min.sortOrder ?? 0) - 1;

    return this.prisma.project.create({
      data: {
        name: body.name,
        nameEn: body.nameEn || null,
        investor: body.investor,
        investorEn: body.investorEn || null,
        projectType: body.projectType,
        projectTypeEn: body.projectTypeEn || null,
        completionTime: body.completionTime,
        completionTimeEn: body.completionTimeEn || null,
        location: body.location,
        locationEn: body.locationEn || null,
        description: body.description || '',
        descriptionEn: body.descriptionEn || null,
        area: body.area,
        areaEn: body.areaEn || null,
        revitLink: body.revitLink || null,
        lat: body.lat || null,
        lng: body.lng || null,
        mainImages: [...bodyMainUrls, ...uploadedMainUrls],
        images: [...bodySubUrls, ...uploadedSubUrls],
        sortOrder: nextSortOrder,
      },
    });
  }

  async reorder(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('Danh sách id không hợp lệ');
    }

    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.project.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    return { success: true };
  }

  async findAll(query?: {
    lang?: 'vi' | 'en';
    projectType?: string;
    investor?: string;
    completionTime?: string;
    q?: string;
    page?: number | string;
    limit?: number | string;
  }) {
    const { lang, projectType, investor, completionTime, q } = query || {};
    const keyword = q?.trim();

    const filters: Prisma.ProjectWhereInput[] = [];
    if (projectType && projectType !== 'ALL') {
      filters.push({
        OR: [{ projectType }, { projectTypeEn: projectType }],
      });
    }
    if (investor && investor !== 'ALL') {
      filters.push({
        OR: [{ investor }, { investorEn: investor }],
      });
    }
    if (completionTime && completionTime !== 'ALL') {
      filters.push({
        OR: [{ completionTime }, { completionTimeEn: completionTime }],
      });
    }
    if (keyword) {
      filters.push({
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { nameEn: { contains: keyword, mode: 'insensitive' } },
          { location: { contains: keyword, mode: 'insensitive' } },
          { locationEn: { contains: keyword, mode: 'insensitive' } },
          { investor: { contains: keyword, mode: 'insensitive' } },
          { investorEn: { contains: keyword, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.ProjectWhereInput =
      filters.length > 0 ? { AND: filters } : {};
    const orderBy: Prisma.ProjectOrderByWithRelationInput[] = [
      { sortOrder: 'asc' },
      { created_at: 'desc' },
    ];
    const pagination = normalizePagination(query, 9, 100);

    const [groupedTypes, groupedInvestors, groupedCompletions] =
      await Promise.all([
        this.prisma.project.groupBy({
          by: ['projectType', 'projectTypeEn'],
          where: { projectType: { not: '' } },
        }),
        this.prisma.project.groupBy({
          by: ['investor', 'investorEn'],
          where: { investor: { not: '' } },
        }),
        this.prisma.project.groupBy({
          by: ['completionTime', 'completionTimeEn'],
          where: { completionTime: { not: '' } },
        }),
      ]);

    const filterOptions = {
      projectTypes: [
        ...new Set(
          groupedTypes
            .map((i) =>
              lang === 'en' ? i.projectTypeEn || i.projectType : i.projectType,
            )
            .filter(Boolean),
        ),
      ],
      investors: [
        ...new Set(
          groupedInvestors
            .map((i) =>
              lang === 'en' ? i.investorEn || i.investor : i.investor,
            )
            .filter(Boolean),
        ),
      ],
      completionTimes: [
        ...new Set(
          groupedCompletions
            .map((i) =>
              lang === 'en'
                ? i.completionTimeEn || i.completionTime
                : i.completionTime,
            )
            .filter(Boolean),
        ),
      ],
    };

    if (!pagination.enabled) {
      const items = await this.prisma.project.findMany({ where, orderBy });
      const data = items.map((item) => this.localizeProject(item, lang));
      return {
        data,
        total: data.length,
        page: 1,
        limit: data.length,
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
      data: items.map((item) => this.localizeProject(item, lang)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
      filters: filterOptions,
    };
  }

  async findOne(id: string, lang?: 'vi' | 'en') {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Không tìm thấy dự án');
    return this.localizeProject(project, lang);
  }

  async update(
    id: string,
    body: UpdateProjectDto,
    files?: {
      mainImages?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    const existing = await this.findOne(id);
    const filesToDelete: string[] = [];

    let keptMainImages: string[] = existing.mainImages || [];
    if (body.mainImages !== undefined) {
      keptMainImages = this.parseStringArray(body.mainImages);
      const removedMain = (existing.mainImages || []).filter(
        (url) => !keptMainImages.includes(url),
      );
      filesToDelete.push(...removedMain);
    } else if (body.existingMainImages !== undefined) {
      keptMainImages = this.parseStringArray(body.existingMainImages);
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
      newMainFiles.map(async (file) => {
        const uploaded = await this.r2Service.uploadImage(
          file,
          'projects/main',
        );
        return uploaded.url;
      }),
    );
    const finalMainImages = [...keptMainImages, ...newMainUrls];
    if (finalMainImages.length === 0) {
      throw new BadRequestException('Dự án phải có ít nhất 1 ảnh chính');
    }

    let keptSubImages: string[] = existing.images || [];
    if (body.images !== undefined) {
      keptSubImages = this.parseStringArray(body.images);
      const removedSub = (existing.images || []).filter(
        (url) => !keptSubImages.includes(url),
      );
      filesToDelete.push(...removedSub);
    } else if (body.existingImages !== undefined) {
      keptSubImages = this.parseStringArray(body.existingImages);
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
      newSubFiles.map(async (file) => {
        const uploaded = await this.r2Service.uploadImage(
          file,
          'projects/gallery',
        );
        return uploaded.url;
      }),
    );

    if (filesToDelete.length > 0) {
      await this.r2Service.deleteByUrls(filesToDelete);
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.nameEn !== undefined && { nameEn: body.nameEn || null }),
        ...(body.investor !== undefined && { investor: body.investor }),
        ...(body.investorEn !== undefined && {
          investorEn: body.investorEn || null,
        }),
        ...(body.projectType !== undefined && {
          projectType: body.projectType,
        }),
        ...(body.projectTypeEn !== undefined && {
          projectTypeEn: body.projectTypeEn || null,
        }),
        ...(body.completionTime !== undefined && {
          completionTime: body.completionTime,
        }),
        ...(body.completionTimeEn !== undefined && {
          completionTimeEn: body.completionTimeEn || null,
        }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.locationEn !== undefined && {
          locationEn: body.locationEn || null,
        }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.descriptionEn !== undefined && {
          descriptionEn: body.descriptionEn || null,
        }),
        ...(body.area !== undefined && { area: body.area }),
        ...(body.areaEn !== undefined && { areaEn: body.areaEn || null }),
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
    await this.r2Service.deleteByUrls([
      ...(existing.mainImages || []),
      ...(existing.images || []),
    ]);
    return this.prisma.project.delete({ where: { id } });
  }
}