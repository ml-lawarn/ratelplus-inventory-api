// src/modules/maintenance/repositories/maintenance.repository.ts

import { Injectable } from '@nestjs/common';

import { MaintenanceStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class MaintenanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MaintenanceRecordCreateInput) {
    return this.prisma.maintenanceRecord.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.maintenanceRecord.findUnique({
      where: { id },

      // Mirrors the include used when updating maintenance status so audit
      // oldValues/newValues snapshots are shape-symmetric and don't produce
      // spurious diffs.
      include: {
        equipmentItem: true,
        vendor: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  // Find maintenance records for a specific equipment item that are either scheduled or in progress
  async findScheduledOrInProgress(equipmentItemId: string) {
    return this.prisma.maintenanceRecord.findMany({
      where: {
        equipmentItemId,
        maintenanceStatus: {
          in: [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS],
        },
      },
      select: {
        id: true,
        maintenanceStatus: true,
        equipmentItemId: true,
      },
    });
  }

  async findMany(params: Prisma.MaintenanceRecordFindManyArgs) {
    return this.prisma.maintenanceRecord.findMany(params);
  }

  async count(where?: Prisma.MaintenanceRecordWhereInput) {
    return this.prisma.maintenanceRecord.count({
      where,
    });
  }

  async update(id: string, data: Prisma.MaintenanceRecordUpdateInput) {
    return this.prisma.maintenanceRecord.update({
      where: { id },
      data,
    });
  }
}
