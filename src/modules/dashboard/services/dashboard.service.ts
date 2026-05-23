// src/modules/dashboard/services/dashboard.service.ts

import { Injectable } from '@nestjs/common';

import {
  AssignmentStatus,
  EquipmentStatus,
  MaintenanceStatus,
} from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary() {
    const now = new Date();

    const [
      totalEquipmentItems,
      totalWarehouses,
      totalAssignments,
      activeAssignments,
      overdueAssignments,
      itemsUnderMaintenance,
      lowStockItems,
      maintenanceAggregate,
      inventoryAggregate,
    ] = await Promise.all([
      this.prisma.equipmentItem.count(),

      this.prisma.warehouse.count(),

      this.prisma.equipmentAssignment.count(),

      this.prisma.equipmentAssignment.count({
        where: {
          assignmentStatus: AssignmentStatus.ASSIGNED,
        },
      }),

      this.prisma.equipmentAssignment.count({
        where: {
          assignmentStatus: AssignmentStatus.ASSIGNED,

          expectedReturnDate: {
            lt: now,
          },
        },
      }),

      this.prisma.equipmentItem.count({
        where: {
          status: EquipmentStatus.MAINTENANCE,
        },
      }),

      this.prisma.equipmentItem.count({
        where: {
          OR: [
            {
              quantity: {
                lte: 0,
              },
            },

            {
              AND: [
                {
                  minimumStockLevel: {
                    not: null,
                  },
                },

                {
                  quantity: {
                    lte: 10,
                  },
                },
              ],
            },
          ],
        },
      }),

      this.prisma.maintenanceRecord.aggregate({
        _sum: {
          repairCost: true,
        },

        where: {
          maintenanceStatus: MaintenanceStatus.COMPLETED,
        },
      }),

      this.prisma.equipmentItem.aggregate({
        _sum: {
          purchaseCost: true,
        },
      }),
    ]);

    return {
      message: 'Dashboard summary retrieved successfully',

      data: {
        totalEquipmentItems,

        totalWarehouses,

        totalAssignments,

        activeAssignments,

        overdueAssignments,

        itemsUnderMaintenance,

        lowStockItems,

        totalInventoryValue: Number(inventoryAggregate._sum.purchaseCost || 0),

        totalMaintenanceCost: Number(maintenanceAggregate._sum.repairCost || 0),
      },
    };
  }

  async getLowStockItems() {
    const items = await this.prisma.equipmentItem.findMany({
      where: {
        OR: [
          {
            quantity: {
              lte: 0,
            },
          },

          {
            AND: [
              {
                minimumStockLevel: {
                  not: null,
                },
              },

              {
                quantity: {
                  lte: 10,
                },
              },
            ],
          },
        ],
      },

      orderBy: {
        quantity: 'asc',
      },

      include: {
        category: true,
        warehouse: true,
      },
    });

    return {
      message: 'Low stock items retrieved successfully',

      data: items,
    };
  }

  async getOverdueAssignments() {
    const now = new Date();

    const assignments = await this.prisma.equipmentAssignment.findMany({
      where: {
        assignmentStatus: AssignmentStatus.ASSIGNED,

        expectedReturnDate: {
          lt: now,
        },
      },

      orderBy: {
        expectedReturnDate: 'asc',
      },

      include: {
        equipmentItem: {
          select: {
            id: true,
            assetTag: true,
            equipmentName: true,
            serialNumber: true,
          },
        },

        assignedToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Overdue assignments retrieved successfully',

      data: assignments,
    };
  }

  async getMaintenanceOverview() {
    const [scheduled, inProgress, completed] = await Promise.all([
      this.prisma.maintenanceRecord.count({
        where: {
          maintenanceStatus: MaintenanceStatus.SCHEDULED,
        },
      }),

      this.prisma.maintenanceRecord.count({
        where: {
          maintenanceStatus: MaintenanceStatus.IN_PROGRESS,
        },
      }),

      this.prisma.maintenanceRecord.count({
        where: {
          maintenanceStatus: MaintenanceStatus.COMPLETED,
        },
      }),
    ]);

    return {
      message: 'Maintenance overview retrieved successfully',

      data: {
        scheduled,
        inProgress,
        completed,
      },
    };
  }

  async getInventoryValueByWarehouse() {
    const warehouses = await this.prisma.warehouse.findMany({
      include: {
        equipmentItems: {
          select: {
            purchaseCost: true,
          },
        },
      },
    });

    const result = warehouses.map((warehouse) => {
      const totalValue = warehouse.equipmentItems.reduce((sum, item) => {
        return sum + Number(item.purchaseCost || 0);
      }, 0);

      return {
        warehouseId: warehouse.id,

        warehouseName: warehouse.name,

        warehouseCode: warehouse.code,

        totalInventoryValue: totalValue,
      };
    });

    return {
      message: 'Warehouse inventory values retrieved successfully',

      data: result,
    };
  }
}
