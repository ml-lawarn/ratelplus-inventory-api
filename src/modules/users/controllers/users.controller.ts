// src/modules/users/controllers/users.controller.ts

import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { UsersService } from '../services/users.service';

import { CreateUserDto } from '../dto/create-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';

import { Roles } from '../../../core/decorators/roles.decorator';

import { Role } from '../../../shared/enums/role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getUsers(@Query() query: UserQueryDto) {
    return this.usersService.getUsers(query);
  }
}
