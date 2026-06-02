// src/modules/maintenance/repositories/maintenance.repository.ts

import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

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

      include: {
        equipmentItem: true,
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
