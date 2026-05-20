// src/modules/categories/controllers/categories.controller.ts

import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { CategoriesService } from '../services/categories.service';

import { CreateCategoryDto } from '../dto/create-category.dto';
import { CategoryQueryDto } from '../dto/category-query.dto';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';

import { Roles } from '../../../core/decorators/roles.decorator';

import { Role } from '../../../shared/enums/role.enum';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.STAFF)
  async getCategories(@Query() query: CategoryQueryDto) {
    return this.categoriesService.getCategories(query);
  }
}
