import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';
import { PrismaService } from '../shared/prisma.service.js';
import { SupabaseService } from '../shared/supabase.service.js';

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

  async findAll() {
    const applications = await this.prismaService.applications.findMany({
      orderBy: { created_at: 'desc' },
    });

    return Promise.all(
      applications.map(async (app) => ({
        ...app,
        cvUrl: await this.supabaseService.getSignedCvUrl(app.cvUrl),
      })),
    );
  }

  async findOne(id: string) {
    const application = await this.prismaService.applications.findUnique({
      where: { id },
    });

    if (!application) return null;

    return {
      ...application,
      cvUrl: await this.supabaseService.getSignedCvUrl(application.cvUrl),
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
