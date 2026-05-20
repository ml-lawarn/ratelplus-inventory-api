// src/modules/auth/auth.controller.ts

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';

import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

import { CurrentUser } from '../../core/decorators/current-user.decorator';

import type { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: JwtPayload) {
    return this.authService.getAuthenticatedUser(user.sub);
  }
}
