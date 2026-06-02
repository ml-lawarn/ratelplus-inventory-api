// src/modules/reports/services/reports.service.ts

import { Injectable } from '@nestjs/common';
import { AssignmentStatus } from '@prisma/client';

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

  async warrantyExpiryReport(days = 30) {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + days);

    const items = await this.prisma.equipmentItem.findMany({
      where: {
        warrantyEndDate: {
          gte: now,
          lte: endDate,
        },
      },
      orderBy: {
        warrantyEndDate: 'asc',
      },
      include: {
        category: true,
        brand: true,
        warehouse: true,
      },
    });

    return {
      message: 'Warranty expiry report generated successfully',
      data: {
        days,
        items,
      },
    };
  }

  async assetUtilisationReport() {
    const items = await this.prisma.equipmentItem.findMany({
      include: {
        assignments: {
          orderBy: {
            checkoutDate: 'asc',
          },
        },
      },
    });

    const now = Date.now();

    const utilisation = items.map((item) => {
      const ageMs = Math.max(now - item.createdAt.getTime(), 1);
      const assignedMs = item.assignments.reduce((total, assignment) => {
        const start = assignment.checkoutDate.getTime();
        const end =
          assignment.assignmentStatus === AssignmentStatus.RETURNED &&
          assignment.actualReturnDate
            ? assignment.actualReturnDate.getTime()
            : now;

        return total + Math.max(end - start, 0);
      }, 0);

      return {
        id: item.id,
        assetTag: item.assetTag,
        equipmentName: item.equipmentName,
        status: item.status,
        utilisationPercent: Number(((assignedMs / ageMs) * 100).toFixed(2)),
      };
    });

    return {
      message: 'Asset utilisation report generated successfully',
      data: utilisation,
    };
  }
}
