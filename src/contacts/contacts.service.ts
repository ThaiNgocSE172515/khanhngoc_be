import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { FindContactsQueryDto } from './dto/find-contacts-query.dto.js';
import { PrismaService } from '../shared/prisma.service.js';
import { normalizePagination } from '../shared/pagination.helper.js';

@Injectable()
export class ContactsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createContactDto: CreateContactDto) {
    return this.prismaService.contact.create({
      data: {
        type: createContactDto.type as any,
        name: createContactDto.name,
        phone: createContactDto.phone,
        email: createContactDto.email,
        address: createContactDto.address,
        message: createContactDto.message,
        company: createContactDto.company,
        mst: createContactDto.mst,
        field: createContactDto.field,
        strength: createContactDto.strength,
        revenuePrev: createContactDto.revenuePrev,
        revenuePlan: createContactDto.revenuePlan,
        link: createContactDto.link,
        note: createContactDto.note,
        status: createContactDto.status || 'pending',
      },
    });
  }

  async findAll(query?: FindContactsQueryDto) {
    const keyword = query?.q?.trim();
    const status = query?.status?.trim();
    const type = query?.type?.trim();

    const filters: Prisma.ContactWhereInput[] = [];

    if (type && type !== 'ALL') {
      filters.push({ type: type as any });
    }

    if (status && status !== 'ALL') {
      filters.push({ status });
    }

    if (keyword) {
      filters.push({
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { email: { contains: keyword, mode: 'insensitive' } },
          { phone: { contains: keyword, mode: 'insensitive' } },
          { company: { contains: keyword, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.ContactWhereInput =
      filters.length > 0 ? { AND: filters } : {};

    const orderBy: Prisma.ContactOrderByWithRelationInput = {
      created_at: 'desc',
    };

    const pagination = normalizePagination(query, 10, 100);

    if (!pagination.enabled) {
      const contacts = await this.prismaService.contact.findMany({
        where,
        orderBy,
      });
      return {
        data: contacts,
        pagination: {
          total: contacts.length,
          page: 1,
          limit: contacts.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    const [total, data] = await Promise.all([
      this.prismaService.contact.count({ where }),
      this.prismaService.contact.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
      }),
    ]);

    const totalPages = Math.ceil(total / pagination.limit) || 1;

    return {
      data,
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
        hasNextPage: pagination.page < totalPages,
        hasPrevPage: pagination.page > 1,
      },
    };
  }

  async findOne(id: string) {
    const contact = await this.prismaService.contact.findUnique({
      where: { id },
    });
    if (!contact) {
      throw new NotFoundException(`Không tìm thấy liên hệ với id: ${id}`);
    }
    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    await this.findOne(id);
    return this.prismaService.contact.update({
      where: { id },
      data: {
        ...updateContactDto,
        type: updateContactDto.type as any,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prismaService.contact.delete({
      where: { id },
    });
  }
}
