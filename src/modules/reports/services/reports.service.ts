// src/modules/reports/services/reports.service.ts

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async inventorySummaryReport() {
    const [totalItems, totalWarehouses, totalCategories] = await Promise.all([
      this.prisma.equipmentItem.count(),

      this.prisma.warehouse.count(),

      this.prisma.category.count(),
    ]);

    return {
      message: 'Inventory summary report generated successfully',

      data: {
        totalItems,
        totalWarehouses,
        totalCategories,
      },
    };
  }

  async maintenanceCostReport() {
    const maintenanceCosts = await this.prisma.maintenanceRecord.aggregate({
      _sum: {
        repairCost: true,
        laborCost: true,
        partsCost: true,
      },
    });

    return {
      message: 'Maintenance cost report generated successfully',

      data: maintenanceCosts,
    };
  }

  async assignmentReport() {
    const [activeAssignments, returnedAssignments] = await Promise.all([
      this.prisma.equipmentAssignment.count({
        where: {
          assignmentStatus: 'ASSIGNED',
        },
      }),

      this.prisma.equipmentAssignment.count({
        where: {
          assignmentStatus: 'RETURNED',
        },
      }),
    ]);

    return {
      message: 'Assignment report generated successfully',

      data: {
        activeAssignments,
        returnedAssignments,
      },
    };
  }
}
