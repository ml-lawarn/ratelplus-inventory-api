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
        throw new BadRequestException('Cannot move a retired equipment item');
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

        case StockMovementType.TRANSFER: {
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
      }

      // Update total quantity in EquipmentItem
      await tx.equipmentItem.update({
        where: { id: equipment.id },
        data: { quantity: newQuantity },
      });

      // --- INVENTORY BALANCE UPDATES ---
      const updateBalance = async (locId: string, qtyChange: number) => {
        const location = await tx.warehouseLocation.findUnique({
          where: { id: locId },
          select: { warehouseId: true },
        });
        if (!location) throw new NotFoundException('Location not found');

        let balance = await tx.inventoryBalance.findUnique({
          where: {
            equipmentItemId_warehouseLocationId: {
              equipmentItemId: equipment.id,
              warehouseLocationId: locId,
            },
          },
        });

        // If no balance record exists, but we are trying to decrement,
        // it means this asset was created before the InventoryBalance system.
        // We initialize it using the EquipmentItem's legacy data.
        if (!balance && qtyChange < 0) {
          if (equipment.warehouseLocationId === locId) {
            balance = await tx.inventoryBalance.create({
              data: {
                equipmentItemId: equipment.id,
                warehouseLocationId: locId,
                warehouseId: location.warehouseId,
                quantity: currentQuantity,
              },
            });
          } else {
            throw new BadRequestException(
              `Insufficient stock at location ${locId}. No inventory record found.`,
            );
          }
        }

        if (balance) {
          if (balance.quantity + qtyChange < 0) {
            throw new BadRequestException(
              `Insufficient stock at location ${locId}. Available: ${balance.quantity}`,
            );
          }
          await tx.inventoryBalance.update({
            where: { id: balance.id },
            data: { quantity: { increment: qtyChange } },
          });
        } else {
          // Creating new balance (STOCK_IN or TRANSFER destination)
          await tx.inventoryBalance.create({
            data: {
              equipmentItemId: equipment.id,
              warehouseLocationId: locId,
              warehouseId: location.warehouseId,
              quantity: qtyChange,
            },
          });
        }
      };

      if (
        dto.movementType === StockMovementType.STOCK_IN &&
        dto.destinationLocationId
      ) {
        await updateBalance(dto.destinationLocationId, dto.quantity);
      } else if (
        dto.movementType === StockMovementType.STOCK_OUT &&
        dto.sourceLocationId
      ) {
        await updateBalance(dto.sourceLocationId, -dto.quantity);
      } else if (
        dto.movementType === StockMovementType.TRANSFER &&
        dto.sourceLocationId &&
        dto.destinationLocationId
      ) {
        await updateBalance(dto.sourceLocationId, -dto.quantity);
        await updateBalance(dto.destinationLocationId, dto.quantity);
      } else if (
        dto.movementType === StockMovementType.ADJUSTMENT &&
        dto.destinationLocationId
      ) {
        const location = await tx.warehouseLocation.findUnique({
          where: { id: dto.destinationLocationId },
          select: { warehouseId: true },
        });
        if (!location) throw new NotFoundException('Location not found');

        await tx.inventoryBalance.upsert({
          where: {
            equipmentItemId_warehouseLocationId: {
              equipmentItemId: equipment.id,
              warehouseLocationId: dto.destinationLocationId,
            },
          },
          update: { quantity: dto.quantity },
          create: {
            equipmentItemId: equipment.id,
            warehouseLocationId: dto.destinationLocationId,
            warehouseId: location.warehouseId,
            quantity: dto.quantity,
          },
        });

        // Re-calculate total quantity for the item
        const allBalances = await tx.inventoryBalance.findMany({
          where: { equipmentItemId: equipment.id },
        });
        const totalQty = allBalances.reduce((sum, b) => sum + b.quantity, 0);
        await tx.equipmentItem.update({
          where: { id: equipment.id },
          data: { quantity: totalQty },
        });
        newQuantity = totalQty;
      }

      if (
        dto.movementType === StockMovementType.TRANSFER &&
        dto.destinationLocationId
      ) {
        const destLoc = await tx.warehouseLocation.findUnique({
          where: { id: dto.destinationLocationId },
        });

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
            warehouse: destLoc?.warehouseId
              ? {
                  connect: {
                    id: destLoc.warehouseId,
                  },
                }
              : undefined,
          },
        });
      }

      const createdMovement = await tx.stockMovement.create({
        data: {
          movementType: dto.movementType,

          quantity: dto.quantity,

          previousQuantity: currentQuantity,

          newQuantity: newQuantity,

          referenceNumber: dto.referenceNumber,

          remarks: dto.remarks,

          equipmentItemId: equipment.id,

          sourceLocationId: dto.sourceLocationId || null,

          destinationLocationId: dto.destinationLocationId || null,

          performedById: userId,
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

      return createdMovement;
    });

    const actorName =
      [performedBy.firstName, performedBy.lastName].filter(Boolean).join(' ') ||
      performedBy.email;

    await this.auditService.logActivity({
      action: 'STOCK_MOVEMENT',

      entityType: 'StockMovement',

      entityId: movement.id,

      description: `${movement.movementType}: ${movement.quantity} units of ${movement.equipmentItem.equipmentName} (${movement.equipmentItem.assetTag}) moved by ${actorName}`,

      remarks: movement.remarks || '',

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
