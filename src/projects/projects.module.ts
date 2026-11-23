import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { PrismaService } from '../shared/prisma.service.js';
import { R2Service } from '../shared/r2.service.js';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaService, R2Service],
  exports: [ProjectsService],
})
export class ProjectsModule {}