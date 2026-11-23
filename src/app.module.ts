import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HiringModule } from './hiring/hiring.module.js';
import { SharedModule } from './shared/shared.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { MembersModule } from './members/members.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ContactsModule } from './contacts/contacts.module.js';
import { AppsModule } from './apps/apps.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com,
    // then run `npx @nestjs/observe link` to write your key pair into .env.
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'khanhngoc_be',
    }),
    HiringModule,
    SharedModule,
    ApplicationsModule,
    ProjectsModule,
    MembersModule,
    AuthModule,
    ContactsModule,
    AppsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
