import { Injectable } from '@nestjs/common';
import { CreateHiringDto } from './dto/create-hiring.dto.js';
import { UpdateHiringDto } from './dto/update-hiring.dto.js';
import { PrismaService } from '../shared/prisma.service.js';

@Injectable()
export class HiringService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createHiringDto: CreateHiringDto) {
    return this.prismaService.job.create({
      data: {
        ...createHiringDto,
      },
    });
  }

  findAll() {
    return this.prismaService.job.findMany();
  }

  findOne(id: string) {
    return this.prismaService.job.findUnique({
      where: {
        job_id: id,
      },
    });
  }

  update(id: string, updateHiringDto: UpdateHiringDto) {
    return this.prismaService.job.update({
      data: {
        ...updateHiringDto,
      },
      where: {
        job_id: id,
      },
    });
  }

  remove(id: string) {
    return this.prismaService.job.delete({
      where: {
        job_id: id,
      },
    });
  }
}
