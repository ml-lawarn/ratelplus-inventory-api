// src/modules/maintenance/controllers/maintenance.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { MaintenanceService } from '../services/maintenance.service';

import { CreateMaintenanceRecordDto } from '../dto/create-maintenance-record.dto';

import { MaintenanceQueryDto } from '../dto/maintenance-query.dto';

import { UpdateMaintenanceStatusDto } from '../dto/update-maintenance-status.dto';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';

import { RolesGuard } from '../../../core/guards/roles.guard';

import { Roles } from '../../../core/decorators/roles.decorator';

import { Role } from '../../../shared/enums/role.enum';

@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  async createMaintenanceRecord(@Body() dto: CreateMaintenanceRecordDto) {
    return this.maintenanceService.createMaintenanceRecord(dto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  async updateMaintenanceStatus(
    @Param('id') id: string,

    @Body() dto: UpdateMaintenanceStatusDto,
  ) {
    return this.maintenanceService.updateMaintenanceStatus(id, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.STAFF)
  async getMaintenanceRecords(@Query() query: MaintenanceQueryDto) {
    return this.maintenanceService.getMaintenanceRecords(query);
  }
}
