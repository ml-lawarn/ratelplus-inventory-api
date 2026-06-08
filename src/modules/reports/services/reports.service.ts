// src/modules/reports/services/reports.service.ts

import { Injectable } from '@nestjs/common';
import { AssignmentStatus } from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

import { PdfService } from '../../../infrastructure/pdf/pdf.service';
import { buildInventorySummaryPdf } from 'src/infrastructure/pdf/templates/inventory-summary.template';
import { buildMaintenanceCostPdf } from 'src/infrastructure/pdf/templates/maintenance-cost.template';
import { buildWarrantyExpiryPdf } from 'src/infrastructure/pdf/templates/warranty-expiry.template';
import { buildAssetUtilisationPdf } from 'src/infrastructure/pdf/templates/asset-utilisation.template';
import { buildAssignmentsPdf } from 'src/infrastructure/pdf/templates/assignments.template';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

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

  async inventorySummaryPdf() {
    const report = await this.inventorySummaryReport();

    return this.pdfService.generatePdf((doc) => {
      buildInventorySummaryPdf(doc, report.data);
    });
  }

  async maintenanceCostPdf() {
    const report = await this.maintenanceCostReport();

    return this.pdfService.generatePdf((doc) => {
      buildMaintenanceCostPdf(doc, report.data);
    });
  }

  async warrantyExpiryPdf(days = 30) {
    const report = await this.warrantyExpiryReport(days);

    return this.pdfService.generatePdf((doc) => {
      buildWarrantyExpiryPdf(doc, report.data);
    });
  }

  async assignmentsPdf() {
    const report = await this.assignmentReport();

    return this.pdfService.generatePdf((doc) => {
      buildAssignmentsPdf(doc, report.data);
    });
  }

  async assetUtilisationPdf() {
    const report = await this.assetUtilisationReport();

    return this.pdfService.generatePdf((doc) => {
      buildAssetUtilisationPdf(doc, report.data);
    });
  }

  async assetUtilisationReport() {
    const items = await this.prisma.equipmentItem.findMany({
      include: {
        assignments: {
          orderBy: {
            checkoutDate: 'asc',
          },
        },
        maintenanceRecords: true,
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
        assignmentCount: item.assignments.length,
        maintenanceCount: item.maintenanceRecords.length,
        utilisationPercent: Number(((assignedMs / ageMs) * 100).toFixed(2)),
      };
    });

    return {
      message: 'Asset utilisation report generated successfully',
      data: utilisation,
    };
  }
}
