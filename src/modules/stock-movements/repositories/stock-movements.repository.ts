// src/modules/stock-movements/repositories/stock-movements.repository.ts

import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class StockMovementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.StockMovementCreateInput) {
    return this.prisma.stockMovement.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.stockMovement.findUnique({
      where: { id },
      include: {
        equipmentItem: true,
        sourceLocation: true,
        destinationLocation: true,
        performedBy: {
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

  async findMany(params: Prisma.StockMovementFindManyArgs) {
    return this.prisma.stockMovement.findMany(params);
  }

  async count(where?: Prisma.StockMovementWhereInput) {
    return this.prisma.stockMovement.count({
      where,
    });
  }
}
