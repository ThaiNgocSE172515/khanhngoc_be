import { Module } from '@nestjs/common';
import { AppsController } from './apps.controller.js';
import { AppsService } from './apps.service.js';
import { R2Service } from '../shared/r2.service.js';

@Module({
  controllers: [AppsController],
  providers: [AppsService, R2Service],
})
export class AppsModule {}