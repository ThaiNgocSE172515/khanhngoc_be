import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { SupabaseService } from './supabase.service.js';

@Global()
@Module({
  providers: [PrismaService, SupabaseService],
  exports: [PrismaService, SupabaseService],
})
export class SharedModule {}
