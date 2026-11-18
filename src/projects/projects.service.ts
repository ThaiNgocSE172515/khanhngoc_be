import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service.js';
import { SupabaseService } from '../shared/supabase.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';

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
    if (mainFiles.length > 3 || subFiles.length > 3) {
      throw new BadRequestException(
        'Mỗi loại chỉ được tải lên tối đa 3 hình ảnh',
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
        revitLink: body.revitLink,
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
    page?: number;
    limit?: number;
  }) {
    const { projectType, investor, completionTime, q, page, limit } =
      query || {};

    const keyword = q?.trim();

    const where: any = {
      AND: [
        projectType && projectType !== 'ALL' ? { projectType } : {},
        investor && investor !== 'ALL' ? { investor } : {},
        completionTime && completionTime !== 'ALL' ? { completionTime } : {},
        keyword
          ? {
              OR: [
                { name: { contains: keyword, mode: 'insensitive' } },
                { location: { contains: keyword, mode: 'insensitive' } },
                { investor: { contains: keyword, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    // Lấy danh sách giá trị duy nhất cho 3 ô select filter
    const [allTypes, allInvestors, allCompletions] = await Promise.all([
      this.prisma.project.findMany({
        select: { projectType: true },
        distinct: ['projectType'],
      }),
      this.prisma.project.findMany({
        select: { investor: true },
        distinct: ['investor'],
      }),
      this.prisma.project.findMany({
        select: { completionTime: true },
        distinct: ['completionTime'],
      }),
    ]);

    const filters = {
      projectTypes: allTypes.map((i) => i.projectType).filter(Boolean),
      investors: allInvestors.map((i) => i.investor).filter(Boolean),
      completionTimes: allCompletions
        .map((i) => i.completionTime)
        .filter(Boolean),
    };

    // Nếu không truyền page/limit (ví dụ trang Admin lấy toàn bộ)
    if (!page || !limit) {
      const items = await this.prisma.project.findMany({
        where,
        orderBy: { created_at: 'desc' },
      });
      return {
        data: items,
        total: items.length,
        page: 1,
        totalPages: 1,
        filters,
      };
    }

    const currentPage = Math.max(1, page);
    const take = Math.max(1, limit);
    const skip = (currentPage - 1) * take;

    const [total, items] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take,
      }),
    ]);

    return {
      data: items,
      total,
      page: currentPage,
      totalPages: Math.max(1, Math.ceil(total / take)),
      filters,
    };
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Không tìm thấy dự án');
    return project;
  }

  async update(
    id: string,
    body: any,
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

    // 2. Xử lý tối đa 3 ảnh phụ
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
    if (keptSubImages.length + newSubFiles.length > 3) {
      throw new BadRequestException('Ảnh phụ tối đa 3 hình');
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
