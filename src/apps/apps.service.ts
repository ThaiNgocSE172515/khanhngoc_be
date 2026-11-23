import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppRelease, Prisma } from '@prisma/client';
import { PrismaService } from '../shared/prisma.service.js';
import { R2Service } from '../shared/r2.service.js';
import { CreateAppDto } from './dto/create-app.dto.js';
import { UpdateAppDto } from './dto/update-app.dto.js';

@Injectable()
export class AppsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2Service,
  ) {}

  private serializeApp(item: AppRelease) {
    return {
      ...item,
      fileSize: Number(item.fileSize),
    };
  }

  async create(
    body: CreateAppDto,
    files?: {
      appFile?: Express.Multer.File[];
      icon?: Express.Multer.File[];
    },
  ) {
    const appFile = files?.appFile?.[0];
    const iconFile = files?.icon?.[0];

    if (!appFile) {
      throw new BadRequestException('Vui lòng chọn file ứng dụng để tải lên');
    }

    const uploadedApp = await this.r2.uploadLargeFile(appFile, 'apps');

    let iconUrl: string | null = body.iconUrl?.trim() || null;
    if (iconFile) {
      const uploadedIcon = await this.r2.uploadImage(iconFile, 'app-icons');
      iconUrl = uploadedIcon.url;
    }

    const created = await this.prisma.appRelease.create({
      data: {
        name: body.name.trim(),
        version: body.version?.trim() || null,
        platform: body.platform?.trim() || null,
        description: body.description?.trim() || null,
        iconUrl, // Có thể để trống (null)
        fileUrl: uploadedApp.url,
        fileKey: uploadedApp.key,
        fileName: uploadedApp.fileName,
        fileSize: BigInt(uploadedApp.size),
      },
    });

    return this.serializeApp(created);
  }

  async findAll(query?: { q?: string; page?: string; limit?: string }) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 10));
    const keyword = query?.q?.trim();

    const where: Prisma.AppReleaseWhereInput = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { version: { contains: keyword, mode: 'insensitive' } },
            { platform: { contains: keyword, mode: 'insensitive' } },
            { fileName: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, items] = await Promise.all([
      this.prisma.appRelease.count({ where }),
      this.prisma.appRelease.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: items.map((i) => this.serializeApp(i)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.appRelease.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Không tìm thấy ứng dụng');
    return item;
  }

  async update(
    id: string,
    body: UpdateAppDto,
    files?: {
      appFile?: Express.Multer.File[];
      icon?: Express.Multer.File[];
    },
  ) {
    const existing = await this.findOne(id);
    const newAppFile = files?.appFile?.[0];
    const newIconFile = files?.icon?.[0];

    let fileUrl = existing.fileUrl;
    let fileKey = existing.fileKey;
    let fileName = existing.fileName;
    let fileSize = existing.fileSize;

    if (newAppFile) {
      const uploadedApp = await this.r2.uploadLargeFile(newAppFile, 'apps');
      await this.r2.deleteByKey(existing.fileKey);
      fileUrl = uploadedApp.url;
      fileKey = uploadedApp.key;
      fileName = uploadedApp.fileName;
      fileSize = BigInt(uploadedApp.size);
    }

    let iconUrl: string | null = existing.iconUrl;
    if (newIconFile) {
      const oldIconKey = this.r2.extractKeyFromUrl(existing.iconUrl);
      const uploadedIcon = await this.r2.uploadImage(newIconFile, 'app-icons');
      if (oldIconKey) await this.r2.deleteByKey(oldIconKey);
      iconUrl = uploadedIcon.url;
    } else if (body.removeIcon) {
      const oldIconKey = this.r2.extractKeyFromUrl(existing.iconUrl);
      if (oldIconKey) await this.r2.deleteByKey(oldIconKey);
      iconUrl = null;
    } else if (body.iconUrl !== undefined) {
      iconUrl = body.iconUrl.trim() || null;
    }

    const updated = await this.prisma.appRelease.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.version !== undefined && {
          version: body.version.trim() || null,
        }),
        ...(body.platform !== undefined && {
          platform: body.platform.trim() || null,
        }),
        ...(body.description !== undefined && {
          description: body.description.trim() || null,
        }),
        iconUrl,
        fileUrl,
        fileKey,
        fileName,
        fileSize,
      },
    });

    return this.serializeApp(updated);
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    const iconKey = this.r2.extractKeyFromUrl(existing.iconUrl);

    await Promise.all([
      this.r2.deleteByKey(existing.fileKey),
      iconKey ? this.r2.deleteByKey(iconKey) : Promise.resolve(),
    ]);

    await this.prisma.appRelease.delete({ where: { id } });
    return { message: 'Đã xóa ứng dụng thành công' };
  }
}