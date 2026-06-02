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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { MaintenanceService } from '../services/maintenance.service';

import { CreateMaintenanceRecordDto } from '../dto/create-maintenance-record.dto';

import { MaintenanceQueryDto } from '../dto/maintenance-query.dto';

import { UpdateMaintenanceStatusDto } from '../dto/update-maintenance-status.dto';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';

import { RolesGuard } from '../../../core/guards/roles.guard';

import { Roles } from '../../../core/decorators/roles.decorator';

import { Role } from '../../../shared/enums/role.enum';

import { CurrentUser } from '../../../core/decorators/current-user.decorator';

import type { JwtPayload } from '../../../shared/interfaces/jwt-payload.interface';

@ApiTags('Maintenance')
@ApiBearerAuth()
@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create maintenance record' })
  @ApiResponse({
    status: 201,
    description: 'Maintenance record created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async createMaintenanceRecord(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateMaintenanceRecordDto,
  ) {
    return this.maintenanceService.createMaintenanceRecord(dto, user.sub);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update maintenance status' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance status updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async updateMaintenanceStatus(
    @Param('id') id: string,

    @Body() dto: UpdateMaintenanceStatusDto,
  ) {
    return this.maintenanceService.updateMaintenanceStatus(id, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'List maintenance records' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance records retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getMaintenanceRecords(@Query() query: MaintenanceQueryDto) {
    return this.maintenanceService.getMaintenanceRecords(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'Get maintenance record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance record retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getMaintenanceRecordById(@Param('id') id: string) {
    return this.maintenanceService.getMaintenanceRecordById(id);
  }
}
