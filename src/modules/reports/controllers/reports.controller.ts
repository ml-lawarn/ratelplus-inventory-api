// src/modules/reports/controllers/reports.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ReportsService } from '../services/reports.service';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';

import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { Role } from '../../../shared/enums/role.enum';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('inventory-summary')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Generate inventory summary report' })
  @ApiResponse({
    status: 200,
    description: 'Inventory summary report generated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async inventorySummary() {
    return this.reportsService.inventorySummaryReport();
  }

  @Get('maintenance-costs')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Generate maintenance costs report' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance cost report generated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async maintenanceCosts() {
    return this.reportsService.maintenanceCostReport();
  }

  @Get('assignments')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Generate assignments report' })
  @ApiResponse({
    status: 200,
    description: 'Assignment report generated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async assignments() {
    return this.reportsService.assignmentReport();
  }

  @Get('warranty-expiry')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Generate warranty expiry report' })
  @ApiResponse({
    status: 200,
    description: 'Warranty expiry report generated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async warrantyExpiry(@Query('days') days?: string) {
    const requestedDays = days ? Number(days) : 30;
    const reportWindow = [30, 60, 90].includes(requestedDays)
      ? requestedDays
      : 30;

    return this.reportsService.warrantyExpiryReport(reportWindow);
  }

  @Get('asset-utilisation')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Generate asset utilisation report' })
  @ApiResponse({
    status: 200,
    description: 'Asset utilisation report generated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async assetUtilisation() {
    return this.reportsService.assetUtilisationReport();
  }
}
