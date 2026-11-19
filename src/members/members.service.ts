import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../shared/prisma.service.js';
import { SupabaseService } from '../shared/supabase.service.js';
import { normalizePagination, PaginationQuery } from '../shared/pagination.helper.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';

export interface FindMembersQuery extends PaginationQuery {
  search?: string;
}

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(body: CreateMemberDto, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng tải lên hình ảnh thành viên');
    }

    const imageUrl = await this.supabaseService.uploadProjectImage(
      file,
      'members',
    );

    return this.prisma.member.create({
      data: {
        name: body.name,
        position: body.position,
        story: body.story || '',
        image: imageUrl,
      },
    });
  }

  async findAll(query?: FindMembersQuery | string) {
    const normalizedQuery: FindMembersQuery =
      typeof query === 'string' ? { search: query } : query || {};
    const keyword = normalizedQuery.search?.trim();

    const where: Prisma.MemberWhereInput | undefined = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { position: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const orderBy: Prisma.MemberOrderByWithRelationInput = { created_at: 'desc' };
    const pagination = normalizePagination(normalizedQuery, 12, 100);

    if (!pagination.enabled) {
      const data = await this.prisma.member.findMany({ where, orderBy });
      return {
        data,
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1,
      };
    }

    const [total, data] = await Promise.all([
      this.prisma.member.count({ where }),
      this.prisma.member.findMany({
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

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundException('Không tìm thấy thành viên');
    }
    return member;
  }

  async update(
    id: string,
    body: UpdateMemberDto,
    file?: Express.Multer.File,
  ) {
    const existing = await this.findOne(id);
    let imageUrl = existing.image;

    if (file) {
      imageUrl = await this.supabaseService.uploadProjectImage(file, 'members');
    }

    const updated = await this.prisma.member.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.position !== undefined && { position: body.position }),
        ...(body.story !== undefined && { story: body.story }),
        image: imageUrl,
      },
    });

    if (file && existing.image) {
      await this.supabaseService.deleteProjectFiles([existing.image]);
    }

    return updated;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    const deleted = await this.prisma.member.delete({ where: { id } });

    if (existing.image) {
      await this.supabaseService.deleteProjectFiles([existing.image]);
    }

    return deleted;
  }
}