// src/modules/inventory/repositories/inventory.repository.ts

import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.EquipmentItemCreateInput) {
    return this.prisma.equipmentItem.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.equipmentItem.findUnique({
      where: { id },

      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            parentCategoryId: true,
          },
        },
        brand: {
          select: { id: true, name: true, description: true },
        },
        vendor: {
          select: { id: true, companyName: true },
        },
        warehouse: {
          select: { id: true, name: true, code: true, managerId: true },
        },
        warehouseLocation: {
          select: { id: true, locationCode: true },
        },
        inventoryBalances: {
          include: {
            warehouse: {
              select: { id: true, name: true, code: true },
            },
            warehouseLocation: {
              select: { id: true, locationCode: true },
            },
          },
        },
      },
    });
  }

  async findByAssetTag(assetTag: string) {
    return this.prisma.equipmentItem.findUnique({
      where: { assetTag },
    });
  }

  async findBySerialNumber(serialNumber: string) {
    return this.prisma.equipmentItem.findUnique({
      where: { serialNumber },
    });
  }

  async findMany(params: Prisma.EquipmentItemFindManyArgs) {
    return this.prisma.equipmentItem.findMany(params);
  }

  async count(where?: Prisma.EquipmentItemWhereInput) {
    return this.prisma.equipmentItem.count({
      where,
    });
  }

  async update(id: string, data: Prisma.EquipmentItemUpdateInput) {
    return this.prisma.equipmentItem.update({
      where: { id },
      data,
      // Mirrors findById's include so audit oldValues/newValues snapshots
      // are shape-symmetric and don't produce spurious diffs.
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            parentCategoryId: true,
          },
        },
        brand: {
          select: { id: true, name: true, description: true },
        },
        vendor: {
          select: { id: true, companyName: true },
        },
        warehouse: {
          select: { id: true, name: true, code: true, managerId: true },
        },
        warehouseLocation: {
          select: { id: true, locationCode: true },
        },
        inventoryBalances: {
          include: {
            warehouse: {
              select: { id: true, name: true, code: true },
            },
            warehouseLocation: {
              select: { id: true, locationCode: true },
            },
          },
        },
      },
    });
  }
}
