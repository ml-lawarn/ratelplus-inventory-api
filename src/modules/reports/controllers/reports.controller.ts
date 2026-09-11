// src/modules/reports/controllers/reports.controller.ts

import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { Throttle } from '@nestjs/throttler';

import { THROTTLE_LIMITS } from 'src/core/constants/throttle.constants';

import { ReportsService } from '../services/reports.service';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';

import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { Role } from '../../../shared/enums/role.enum';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Throttle({
  default: THROTTLE_LIMITS.REPORTS,
})
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
  async assetUtilisation(@Query() query: PaginationQueryDto) {
    return this.reportsService.assetUtilisationReport(query);
  }

  @Get('inventory-summary/pdf')
  @ApiOperation({ summary: 'Download inventory summary report as PDF' })
  @ApiResponse({
    status: 200,
    description: 'Inventory summary PDF generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  async inventorySummaryPdf(@Res() res: Response) {
    const pdf = await this.reportsService.inventorySummaryPdf();

    res.set({
      'Content-Type': 'application/pdf',

      'Content-Disposition': 'attachment; filename=inventory-summary.pdf',
    });

    res.send(pdf);
  }

  @Get('maintenance-costs/pdf')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  async maintenanceCostsPdf(@Res() res: Response) {
    const pdf = await this.reportsService.maintenanceCostPdf();

    res.set({
      'Content-Type': 'application/pdf',

      'Content-Disposition': 'attachment; filename=maintenance-costs.pdf',
    });

    res.send(pdf);
  }

  @Get('assignments/pdf')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  async assignmentsPdf(@Res() res: Response) {
    const pdf = await this.reportsService.assignmentsPdf();

    res.set({
      'Content-Type': 'application/pdf',

      'Content-Disposition': 'attachment; filename=assignments.pdf',
    });

    res.send(pdf);
  }

  @Get('warranty-expiry/pdf')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Download warranty expiry report as PDF' })
  @ApiResponse({
    status: 200,
    description: 'Warranty expiry PDF generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days until warranty expiry (default: 30)',
    example: 30,
    schema: {
      type: 'integer',
      enum: [30, 60, 90],
      default: 30,
    },
  })
  async warrantyExpiryPdf(@Res() res: Response, @Query('days') days?: string) {
    const requestedDays = days ? Number(days) : 30;
    const reportWindow = [30, 60, 90].includes(requestedDays)
      ? requestedDays
      : 30;

    const pdf = await this.reportsService.warrantyExpiryPdf(reportWindow);

    res.set({
      'Content-Type': 'application/pdf',

      'Content-Disposition': `attachment; filename=warranty-expiry-${reportWindow}-days.pdf`,
    });

    res.send(pdf);
  }

  @Get('asset-utilisation/pdf')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  async assetUtilisationPdf(@Res() res: Response) {
    const pdf = await this.reportsService.assetUtilisationPdf();

    res.set({
      'Content-Type': 'application/pdf',

      'Content-Disposition': 'attachment; filename=asset-utilisation.pdf',
    });

    res.send(pdf);
  }
}
