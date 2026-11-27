import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Resend } from 'resend';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { FindContactsQueryDto } from './dto/find-contacts-query.dto.js';
import { PrismaService } from '../shared/prisma.service.js';
import { normalizePagination } from '../shared/pagination.helper.js';
import envInstance from '../shared/env.config.js';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);
  private readonly resend = envInstance.RESEND_API_KEY
    ? new Resend(envInstance.RESEND_API_KEY)
    : null;

  constructor(private readonly prismaService: PrismaService) {}

  private escapeHtml(val?: string | number | null): string {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private async sendNotificationEmail(contact: Record<string, any>) {
    if (!this.resend || !envInstance.RESEND_API_KEY) {
      this.logger.warn('Chưa cấu hình RESEND_API_KEY, bỏ qua gửi email.');
      return;
    }

    const receiver =
      envInstance.CONTACT_RECEIVER_EMAIL || 'khanhngoc.dtngoc@gmail.com';

    const typeLabelMap: Record<string, string> = {
      contact: 'Liên hệ tư vấn',
      profile: 'Hồ sơ năng lực / Nhà thầu',
      tender: 'Mời thầu / Báo giá',
    };
    const typeLabel =
      typeLabelMap[String(contact.type || '').toLowerCase()] ||
      contact.type ||
      'Liên hệ mới';

    const extraRows = [
      { label: 'Công ty / Đơn vị', value: contact.company },
      { label: 'Mã số thuế (MST)', value: contact.mst },
      { label: 'Địa chỉ', value: contact.address },
      { label: 'Lĩnh vực hoạt động', value: contact.field },
      { label: 'Năng lực / Thế mạnh', value: contact.strength },
      { label: 'Doanh thu năm trước', value: contact.revenuePrev },
      { label: 'Kế hoạch doanh thu', value: contact.revenuePlan },
      { label: 'Link hồ sơ / Website', value: contact.link, isLink: true },
      { label: 'Ghi chú thêm', value: contact.note },
    ]
      .filter(
        (item) =>
          item.value !== null &&
          item.value !== undefined &&
          String(item.value).trim() !== '',
      )
      .map(
        (item) => `
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%; background: #f8fafc;">
              ${item.label}
            </td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">
              ${
                item.isLink
                  ? `<a href="${this.escapeHtml(item.value)}" target="_blank">${this.escapeHtml(item.value)}</a>`
                  : this.escapeHtml(item.value)
              }
            </td>
          </tr>`,
      )
      .join('');

    try {
      const { error } = await this.resend.emails.send({
        from: 'noreply@triageflow.me',
        to: [receiver],
        ...(contact.email?.trim() ? { replyTo: contact.email.trim() } : {}),
        subject: `[${typeLabel}] ${this.escapeHtml(contact.name)} - ${this.escapeHtml(contact.phone)}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #14233A; max-width: 640px;">
            <h2 style="color: #073763; border-bottom: 2px solid #073763; padding-bottom: 8px; margin-bottom: 16px;">
              Thông báo ${this.escapeHtml(typeLabel)} mới
            </h2>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%; background: #f8fafc;">
                  Người liên hệ
                </td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">
                  ${this.escapeHtml(contact.name)}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">
                  Số điện thoại
                </td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">
                  <a href="tel:${this.escapeHtml(contact.phone)}">${this.escapeHtml(contact.phone)}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">
                  Email
                </td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">
                  ${contact.email ? this.escapeHtml(contact.email) : 'Không cung cấp'}
                </td>
              </tr>
              ${extraRows}
            </table>

            ${
              contact.message
                ? `<div style="margin-top: 16px; padding: 14px; background: #f3f6fa; border-left: 4px solid #073763; border-radius: 6px;">
                    <strong>Nội dung lời nhắn:</strong>
                    <p style="white-space: pre-line; margin: 6px 0 0;">${this.escapeHtml(contact.message)}</p>
                  </div>`
                : ''
            }
          </div>
        `,
      });

      if (error) {
        this.logger.error(
          `Gửi email Resend thất bại (${error.name}): ${error.message}`,
        );
      }
    } catch (err: any) {
      this.logger.error(`Lỗi gọi Resend API: ${err?.message || err}`);
    }
  }

  async create(createContactDto: CreateContactDto) {
    const created = await this.prismaService.contact.create({
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

    // Await để request tới Resend hoàn tất trước khi hàm kết thúc (tránh bị cắt kết nối trên serverless)
    await this.sendNotificationEmail(created);

    return created;
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