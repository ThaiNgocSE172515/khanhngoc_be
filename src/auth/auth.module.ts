import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../shared/prisma.service.js';
import { SupabaseService } from '../shared/supabase.service.js';
import { SupabaseAuthGuard } from '../shared/guards/supabase-auth.guard.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, SupabaseService, SupabaseAuthGuard],
  exports: [AuthService, SupabaseAuthGuard, PrismaService, SupabaseService],
})
export class AuthModule {}