// src/modules/stock-movements/services/stock-movements.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, StockMovementType } from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

import { buildPagination } from '../../../shared/utils/pagination.util';

import { InventoryRepository } from '../../inventory/repositories/inventory.repository';

import { WarehouseLocationsRepository } from '../../warehouse-locations/repositories/warehouse-locations.repository';

import { UsersRepository } from '../../users/repositories/users.repository';

import { CreateStockMovementDto } from '../dto/create-stock-movement.dto';

import { StockMovementQueryDto } from '../dto/stock-movement-query.dto';

import { StockMovementsRepository } from '../repositories/stock-movements.repository';

import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class StockMovementsService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly stockMovementsRepository: StockMovementsRepository,

    private readonly inventoryRepository: InventoryRepository,

    private readonly warehouseLocationsRepository: WarehouseLocationsRepository,

    private readonly usersRepository: UsersRepository,

    private readonly auditService: AuditService,
  ) {}

  async createStockMovement(dto: CreateStockMovementDto, userId: string) {
    const performedBy = await this.usersRepository.findById(userId);

    if (!performedBy) {
      throw new NotFoundException('User not found');
    }

    if (!performedBy.isActive) {
      throw new BadRequestException(
        'Cannot record stock movement for deactivated user',
      );
    }

    let sourceLocation:
      | Awaited<ReturnType<typeof this.warehouseLocationsRepository.findById>>
      | undefined;
    let destinationLocation:
      | Awaited<ReturnType<typeof this.warehouseLocationsRepository.findById>>
      | undefined;

    if (dto.sourceLocationId) {
      sourceLocation = await this.warehouseLocationsRepository.findById(
        dto.sourceLocationId,
      );

      if (!sourceLocation) {
        throw new NotFoundException('Source location not found');
      }
    }

    if (dto.destinationLocationId) {
      destinationLocation = await this.warehouseLocationsRepository.findById(
        dto.destinationLocationId,
      );

      if (!destinationLocation) {
        throw new NotFoundException('Destination location not found');
      }
    }

    const movement = await this.prisma.$transaction(async (tx) => {
      const equipment = await tx.equipmentItem.findUnique({
        where: { id: dto.equipmentItemId },
      });

      if (!equipment) {
        throw new NotFoundException('Equipment item not found');
      }

      if (equipment.status === 'RETIRED') {
        throw new BadRequestException(
          'Retired equipment cannot have stock adjustments',
        );
      }

      const currentQuantity = equipment.quantity;

      let newQuantity = currentQuantity;

      switch (dto.movementType) {
        case StockMovementType.STOCK_IN:
          newQuantity = currentQuantity + dto.quantity;
          break;

        case StockMovementType.STOCK_OUT:
          if (currentQuantity < dto.quantity) {
            throw new BadRequestException('Insufficient stock quantity');
          }

          newQuantity = currentQuantity - dto.quantity;

          break;

        case StockMovementType.ADJUSTMENT:
          newQuantity = dto.quantity;
          break;

        case StockMovementType.TRANSFER:
          if (currentQuantity < dto.quantity) {
            throw new BadRequestException('Insufficient stock quantity');
          }

          if (!dto.sourceLocationId) {
            throw new BadRequestException('Transfer requires source location');
          }

          if (!dto.destinationLocationId) {
            throw new BadRequestException(
              'Transfer requires destination location',
            );
          }

          if (dto.sourceLocationId === dto.destinationLocationId) {
            throw new BadRequestException(
              'Source and destination locations cannot be the same',
            );
          }

          newQuantity = currentQuantity;

          break;
      }

      if (dto.movementType !== StockMovementType.TRANSFER) {
        await tx.equipmentItem.update({
          where: {
            id: equipment.id,
          },

          data: {
            quantity: newQuantity,
          },
        });
      }

      if (
        dto.movementType === StockMovementType.TRANSFER &&
        dto.destinationLocationId
      ) {
        await tx.equipmentItem.update({
          where: {
            id: equipment.id,
          },

          data: {
            warehouseLocation: {
              connect: {
                id: dto.destinationLocationId,
              },
            },
          },
        });
      }

      return tx.stockMovement.create({
        data: {
          movementType: dto.movementType,

          quantity: dto.quantity,

          previousQuantity: currentQuantity,

          newQuantity,

          referenceNumber: dto.referenceNumber,

          remarks: dto.remarks,

          equipmentItem: {
            connect: {
              id: dto.equipmentItemId,
            },
          },

          sourceLocation: dto.sourceLocationId
            ? {
                connect: {
                  id: dto.sourceLocationId,
                },
              }
            : undefined,

          destinationLocation: dto.destinationLocationId
            ? {
                connect: {
                  id: dto.destinationLocationId,
                },
              }
            : undefined,

          performedBy: {
            connect: {
              id: userId,
            },
          },
        },

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
    });

    const actorName =
      [performedBy.firstName, performedBy.lastName].filter(Boolean).join(' ') ||
      performedBy.email;

    await this.auditService.logActivity({
      action: 'STOCK_MOVEMENT',

      entityType: 'StockMovement',

      entityId: movement.id,

      description: `${movement.movementType}: ${movement.quantity} units of ${movement.equipmentItem.equipmentName} (${movement.equipmentItem.assetTag}) moved by ${actorName}`,

      newValues: movement,

      performedById: userId,
    });

    return {
      message: 'Stock movement recorded successfully',

      data: movement,
    };
  }

  async getStockMovements(query: StockMovementQueryDto) {
    const page = query.page || 1;

    const limit = query.limit || 10;

    const search = query.search?.trim();

    const { skip, take } = buildPagination(page, limit);

    const where: Prisma.StockMovementWhereInput = {
      ...(query.equipmentItemId && {
        equipmentItemId: query.equipmentItemId,
      }),

      ...(query.movementType && {
        movementType: query.movementType,
      }),

      ...(search && {
        OR: [
          {
            equipmentItem: {
              equipmentName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            equipmentItem: {
              assetTag: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ],
      }),
    };

    const [movements, total] = await Promise.all([
      this.stockMovementsRepository.findMany({
        where,

        skip,
        take,

        orderBy: {
          movementDate: 'desc',
        },

        include: {
          equipmentItem: {
            select: {
              id: true,
              assetTag: true,
              equipmentName: true,
            },
          },

          sourceLocation: {
            select: {
              id: true,
              locationCode: true,
            },
          },

          destinationLocation: {
            select: {
              id: true,
              locationCode: true,
            },
          },

          performedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),

      this.stockMovementsRepository.count(where),
    ]);

    return {
      message: 'Stock movements retrieved successfully',

      data: {
        items: movements,

        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getStockMovementById(id: string) {
    const movement = await this.stockMovementsRepository.findById(id);

    if (!movement) {
      throw new NotFoundException('Stock movement not found');
    }

    return {
      message: 'Stock movement retrieved successfully',
      data: movement,
    };
  }
}
