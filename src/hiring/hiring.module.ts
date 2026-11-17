import { Module } from '@nestjs/common';
import { HiringService } from './hiring.service.js';
import { HiringController } from './hiring.controller.js';
import { PrismaService } from '../shared/prisma.service.js';
import { SharedModule } from '../shared/shared.module.js';

@Module({
  controllers: [HiringController],
  providers: [HiringService, PrismaService],
  imports: [SharedModule]
})
export class HiringModule {}
