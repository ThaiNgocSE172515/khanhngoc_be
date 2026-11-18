import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../shared/prisma.service.js';
import { SupabaseService } from '../shared/supabase.service.js';
import { LoginDto, RegisterDto, UpdateDto } from './dto/create-auth.dto.js';


@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  // 1. ĐĂNG KÝ (Mặc định luôn là USER)
  async register(dto: RegisterDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: { full_name: dto.fullName },
      },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data.user) {
      throw new InternalServerErrorException('Không thể khởi tạo tài khoản trên Supabase');
    }

    try {
      const dbUser = await this.prisma.user.upsert({
        where: { id: data.user.id },
        update: {
          email: dto.email,
          fullName: dto.fullName,
        },
        create: {
          id: data.user.id,
          email: dto.email,
          fullName: dto.fullName ?? '',
          role: Role.USER,
        },
      });

      return {
        message: 'Đăng ký thành công',
        user: dbUser,
        session: data.session,
      };
    } catch {
      throw new InternalServerErrorException('Lỗi lưu thông tin người dùng vào Database');
    }
  }

  // 2. ĐĂNG NHẬP
  async login(dto: LoginDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.user || !data.session) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const dbUser = await this.prisma.user.upsert({
      where: { id: data.user.id },
      update: {},
      create: {
        id: data.user.id,
        email: data.user.email!,
        fullName: data.user.user_metadata?.full_name ?? '',
        role: Role.USER,
      },
    });

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      user: dbUser,
    };
  }

  // 3. CẬP NHẬT PROFILE / MẬT KHẨU
  async updateProfile(userId: string, dto: UpdateDto) {
    const supabase = this.supabaseService.getClient();

    if (dto.password) {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: dto.password,
      });
      if (error) {
        throw new BadRequestException(`Lỗi đổi mật khẩu: ${error.message}`);
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
      },
    });

    return {
      message: 'Cập nhật thông tin thành công',
      user: updatedUser,
    };
  }

  // 4. LÀM MỚI TOKEN
  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Thiếu refreshToken');
    }

    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
    };
  }

  // 5. ĐĂNG XUẤT
  async logout() {
    const supabase = this.supabaseService.getClient();
    await supabase.auth.signOut();
    return { message: 'Đăng xuất thành công' };
  }

  // 6. [ADMIN] LẤY DANH SÁCH USER
  async findAllUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // 7. [ADMIN] XÓA USER
  async removeUser(targetUserId: string) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.auth.admin.deleteUser(targetUserId);
    if (error) {
      throw new BadRequestException(`Lỗi xóa user trên Supabase: ${error.message}`);
    }

    await this.prisma.user.delete({
      where: { id: targetUserId },
    });

    return { message: 'Đã xóa người dùng thành công' };
  }
}