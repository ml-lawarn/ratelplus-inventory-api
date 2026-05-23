// src/modules/reports/controllers/reports.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';

import { ReportsService } from '../services/reports.service';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';

import { RolesGuard } from '../../../core/guards/roles.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('inventory-summary')
  async inventorySummary() {
    return this.reportsService.inventorySummaryReport();
  }

  @Get('maintenance-costs')
  async maintenanceCosts() {
    return this.reportsService.maintenanceCostReport();
  }

  @Get('assignments')
  async assignments() {
    return this.reportsService.assignmentReport();
  }
}
