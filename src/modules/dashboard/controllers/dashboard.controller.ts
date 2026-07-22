// src/modules/dashboard/controllers/dashboard.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { DashboardService } from '../services/dashboard.service';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';

import { RolesGuard } from '../../../core/guards/roles.guard';

import { Roles } from '../../../core/decorators/roles.decorator';

import { Role } from '../../../shared/enums/role.enum';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Roles(
    Role.ADMIN,
    Role.SUPER_ADMIN,
    Role.MANAGER,
    Role.STAFF,
    Role.TRAINEE,
    Role.INTERN,
  )
  @ApiOperation({ summary: 'Get dashboard summary' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard summary retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getDashboardSummary() {
    return this.dashboardService.getDashboardSummary();
  }

  @Get('low-stock')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get low stock items' })
  @ApiResponse({
    status: 200,
    description: 'Low stock items retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getLowStockItems() {
    return this.dashboardService.getLowStockItems();
  }

  @Get('overdue-assignments')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get overdue assignments' })
  @ApiResponse({
    status: 200,
    description: 'Overdue assignments retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getOverdueAssignments() {
    return this.dashboardService.getOverdueAssignments();
  }

  @Get('maintenance-overview')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get maintenance overview' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance overview retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getMaintenanceOverview() {
    return this.dashboardService.getMaintenanceOverview();
  }

  @Get('warehouse-values')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get inventory value by warehouse' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse values retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getInventoryValueByWarehouse() {
    return this.dashboardService.getInventoryValueByWarehouse();
  }
}
