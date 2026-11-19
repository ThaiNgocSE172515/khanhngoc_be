import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Member } from '@prisma/client';
import { PrismaService } from '../shared/prisma.service.js';
import { SupabaseService } from '../shared/supabase.service.js';
import { normalizePagination, PaginationQuery } from '../shared/pagination.helper.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';

export interface FindMembersQuery extends PaginationQuery {
  lang?: 'vi' | 'en';
  search?: string;
}

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  private localizeMember(member: Member, lang?: 'vi' | 'en') {
    if (lang !== 'en') return member;

    return {
      ...member,
      name: member.nameEn || member.name,
      position: member.positionEn || member.position,
      story: member.storyEn || member.story,
    };
  }

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
        nameEn: body.nameEn || null,
        position: body.position,
        positionEn: body.positionEn || null,
        story: body.story || '',
        storyEn: body.storyEn || null,
        image: imageUrl,
      },
    });
  }

  async findAll(query?: FindMembersQuery | string) {
    const normalizedQuery: FindMembersQuery =
      typeof query === 'string' ? { search: query } : query || {};
    const lang = normalizedQuery.lang;
    const keyword = normalizedQuery.search?.trim();

    const where: Prisma.MemberWhereInput | undefined = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { nameEn: { contains: keyword, mode: 'insensitive' } },
            { position: { contains: keyword, mode: 'insensitive' } },
            { positionEn: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const orderBy: Prisma.MemberOrderByWithRelationInput = { created_at: 'desc' };
    const pagination = normalizePagination(normalizedQuery, 12, 100);

    if (!pagination.enabled) {
      const rawData = await this.prisma.member.findMany({ where, orderBy });
      const data = rawData.map((item) => this.localizeMember(item, lang));
      return {
        data,
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1,
      };
    }

    const [total, rawData] = await Promise.all([
      this.prisma.member.count({ where }),
      this.prisma.member.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
      }),
    ]);

    return {
      data: rawData.map((item) => this.localizeMember(item, lang)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
    };
  }

  async findOne(id: string, lang?: 'vi' | 'en') {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundException('Không tìm thấy thành viên');
    }
    return this.localizeMember(member, lang);
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
        ...(body.nameEn !== undefined && { nameEn: body.nameEn || null }),
        ...(body.position !== undefined && { position: body.position }),
        ...(body.positionEn !== undefined && {
          positionEn: body.positionEn || null,
        }),
        ...(body.story !== undefined && { story: body.story }),
        ...(body.storyEn !== undefined && { storyEn: body.storyEn || null }),
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