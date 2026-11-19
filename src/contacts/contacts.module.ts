import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service.js';
import { ContactsController } from './contacts.controller.js';
import { SharedModule } from '../shared/shared.module.js';

@Module({
  imports: [SharedModule],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
