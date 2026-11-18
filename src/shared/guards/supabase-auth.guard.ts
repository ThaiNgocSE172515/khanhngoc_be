import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

import { ROLES_KEY } from '../decorators/auth.decorator.js';
import { SupabaseService } from '../supabase.service.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Thiếu hoặc sai định dạng Token');
    }

    const token = authHeader.split(' ')[1];
    const supabase = this.supabaseService.getClient();

    // 1. Xác thực token với Supabase Auth
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }

    // 2. Lấy thông tin user và Role từ Prisma
    const dbUser = await this.prisma.user.findUnique({
      where: { id: data.user.id },
    });

    if (!dbUser) {
      throw new UnauthorizedException('Tài khoản chưa được đồng bộ trong hệ thống');
    }

    request.user = dbUser;

    // 3. Kiểm tra phân quyền nếu route có gắn @Roles(...)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!requiredRoles.includes(dbUser.role)) {
      throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này');
    }

    return true;
  }
}