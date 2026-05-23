// src/modules/departments/controllers/departments.controller.ts

import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { DepartmentsService } from '../services/departments.service';

import { CreateDepartmentDto } from '../dto/create-department.dto';
import { DepartmentQueryDto } from '../dto/department-query.dto';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';

import { Roles } from '../../../core/decorators/roles.decorator';

import { Role } from '../../../shared/enums/role.enum';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.createDepartment(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  async getDepartments(@Query() query: DepartmentQueryDto) {
    return this.departmentsService.getDepartments(query);
  }
}
