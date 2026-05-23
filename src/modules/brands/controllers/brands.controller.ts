// src/modules/brands/controllers/brands.controller.ts

import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { BrandsService } from '../services/brands.service';

import { CreateBrandDto } from '../dto/create-brand.dto';
import { BrandQueryDto } from '../dto/brand-query.dto';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';

import { Roles } from '../../../core/decorators/roles.decorator';

import { Role } from '../../../shared/enums/role.enum';

@Controller('brands')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async createBrand(@Body() dto: CreateBrandDto) {
    return this.brandsService.createBrand(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.STAFF)
  async getBrands(@Query() query: BrandQueryDto) {
    return this.brandsService.getBrands(query);
  }
}
