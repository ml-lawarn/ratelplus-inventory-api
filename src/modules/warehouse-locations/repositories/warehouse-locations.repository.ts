// src/modules/warehouse-locations/repositories/warehouse-locations.repository.ts

import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class WarehouseLocationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.WarehouseLocationCreateInput) {
    return this.prisma.warehouseLocation.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.warehouseLocation.findUnique({
      where: { id },

      include: {
        warehouse: true,
      },
    });
  }

  async findByWarehouseAndCode(warehouseId: string, locationCode: string) {
    return this.prisma.warehouseLocation.findFirst({
      where: {
        warehouseId,
        locationCode,
      },
    });
  }

  async findMany(params: Prisma.WarehouseLocationFindManyArgs) {
    return this.prisma.warehouseLocation.findMany(params);
  }

  async count(where?: Prisma.WarehouseLocationWhereInput) {
    return this.prisma.warehouseLocation.count({
      where,
    });
  }

  async update(id: string, data: Prisma.WarehouseLocationUpdateInput) {
    return this.prisma.warehouseLocation.update({
      where: { id },
      data,
    });
  }
}
