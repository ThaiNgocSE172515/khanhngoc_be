import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service.js';
import { ApplicationsController } from './applications.controller.js';
import { SharedModule } from '../shared/shared.module.js';

@Module({
  imports: [SharedModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
