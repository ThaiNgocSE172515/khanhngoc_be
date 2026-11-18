import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role, type User } from '@prisma/client';
import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto, UpdateDto } from './dto/create-auth.dto.js';
import { SupabaseAuthGuard } from '../shared/guards/supabase-auth.guard.js';
import { CurrentUser, Roles } from '../shared/decorators/auth.decorator.js';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ================= PUBLIC ROUTES =================
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  // ================= USER & ADMIN ROUTES =================
  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('me')
  updateProfile(@CurrentUser('id') userId: string, @Body() updateDto: UpdateDto) {
    return this.authService.updateProfile(userId, updateDto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('logout')
  logout() {
    return this.authService.logout();
  }

  // ================= ADMIN ONLY ROUTES =================
  @UseGuards(SupabaseAuthGuard)
  @Roles(Role.ADMIN)
  @Get('users')
  findAllUsers() {
    return this.authService.findAllUsers();
  }

  @UseGuards(SupabaseAuthGuard)
  @Roles(Role.ADMIN)
  @Delete('users/:id')
  removeUser(@Param('id') id: string) {
    return this.authService.removeUser(id);
  }
}