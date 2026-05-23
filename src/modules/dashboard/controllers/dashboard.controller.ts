// src/modules/dashboard/controllers/dashboard.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';

import { DashboardService } from '../services/dashboard.service';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';

import { RolesGuard } from '../../../core/guards/roles.guard';

import { Roles } from '../../../core/decorators/roles.decorator';

import { Role } from '../../../shared/enums/role.enum';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  async getDashboardSummary() {
    return this.dashboardService.getDashboardSummary();
  }

  @Get('low-stock')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  async getLowStockItems() {
    return this.dashboardService.getLowStockItems();
  }

  @Get('overdue-assignments')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  async getOverdueAssignments() {
    return this.dashboardService.getOverdueAssignments();
  }

  @Get('maintenance-overview')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  async getMaintenanceOverview() {
    return this.dashboardService.getMaintenanceOverview();
  }

  @Get('warehouse-values')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  async getInventoryValueByWarehouse() {
    return this.dashboardService.getInventoryValueByWarehouse();
  }
}
