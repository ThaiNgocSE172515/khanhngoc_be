import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service.js';
import { SupabaseService } from '../shared/supabase.service.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';

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

  async findAll(search?: string) {
    const keyword = search?.trim();

    return this.prisma.member.findMany({
      where: keyword
        ? {
            OR: [
              { name: { contains: keyword, mode: 'insensitive' } },
              { position: { contains: keyword, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { created_at: 'desc' },
    });
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

    // Xóa ảnh cũ trên Supabase sau khi DB cập nhật thành công
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