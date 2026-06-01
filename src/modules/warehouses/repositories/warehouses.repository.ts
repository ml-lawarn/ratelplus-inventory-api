// src/modules/warehouses/repositories/warehouses.repository.ts

import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class WarehousesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.WarehouseCreateInput) {
    return this.prisma.warehouse.create({
      data,
    });
  }

  async findByCode(code: string) {
    return this.prisma.warehouse.findUnique({
      where: { code },
    });
  }

  async findById(id: string) {
    return this.prisma.warehouse.findUnique({
      where: { id },
    });
  }

  async findMany(params: Prisma.WarehouseFindManyArgs) {
    return this.prisma.warehouse.findMany(params);
  }

  async count(where?: Prisma.WarehouseWhereInput) {
    return this.prisma.warehouse.count({
      where,
    });
  }

  async update(id: string, data: Prisma.WarehouseUpdateInput) {
    return this.prisma.warehouse.update({
      where: { id },
      data,
    });
  }
}
