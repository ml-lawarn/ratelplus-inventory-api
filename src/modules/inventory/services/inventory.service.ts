// src/modules/inventory/services/inventory.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { Prisma, EquipmentStatus, NotificationType } from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

import { buildPagination } from '../../../shared/utils/pagination.util';

import { CategoriesRepository } from '../../categories/repositories/categories.repository';

import { BrandsRepository } from '../../brands/repositories/brands.repository';

import { VendorsRepository } from '../../vendors/repositories/vendors.repository';

import { WarehousesRepository } from '../../warehouses/repositories/warehouses.repository';

import { WarehouseLocationsRepository } from '../../warehouse-locations/repositories/warehouse-locations.repository';

import { CreateEquipmentItemDto } from '../dto/create-equipment-item.dto';
import { UpdateEquipmentItemDto } from '../dto/update-equipment-item.dto';
import { UpdateEquipmentStatusDto } from '../dto/update-equipment-status.dto';

import { InventoryQueryDto } from '../dto/inventory-query.dto';

import { InventoryRepository } from '../repositories/inventory.repository';

import { NotificationsService } from '../../notifications/services/notifications.service';
import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly inventoryRepository: InventoryRepository,

    private readonly categoriesRepository: CategoriesRepository,

    private readonly brandsRepository: BrandsRepository,

    private readonly vendorsRepository: VendorsRepository,

    private readonly warehousesRepository: WarehousesRepository,

    private readonly warehouseLocationsRepository: WarehouseLocationsRepository,

    private readonly notificationsService: NotificationsService,

    private readonly auditService: AuditService,
  ) {}

  async createEquipmentItem(dto: CreateEquipmentItemDto, userId: string) {
    const existingAsset = await this.inventoryRepository.findByAssetTag(
      dto.assetTag,
    );

    if (existingAsset) {
      throw new ConflictException('Asset tag already exists');
    }

    if (dto.serialNumber) {
      const existingSerial = await this.inventoryRepository.findBySerialNumber(
        dto.serialNumber,
      );

      if (existingSerial) {
        throw new ConflictException('Serial number already exists');
      }
    }

    if (dto.isSerialized && !dto.serialNumber) {
      throw new BadRequestException(
        'Serialized equipment requires serial number',
      );
    }

    if (dto.isSerialized && dto.quantity && dto.quantity > 1) {
      throw new BadRequestException(
        'Serialized equipment quantity cannot exceed 1',
      );
    }

    if (dto.categoryId) {
      const category = await this.categoriesRepository.findById(dto.categoryId);

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    if (dto.brandId) {
      const brand = await this.brandsRepository.findById(dto.brandId);

      if (!brand) {
        throw new NotFoundException('Brand not found');
      }
    }

    if (dto.vendorId) {
      const vendor = await this.vendorsRepository.findById(dto.vendorId);

      if (!vendor) {
        throw new NotFoundException('Vendor not found');
      }
    }

    if (dto.warehouseId) {
      const warehouse = await this.warehousesRepository.findById(
        dto.warehouseId,
      );

      if (!warehouse) {
        throw new NotFoundException('Warehouse not found');
      }

      if (!warehouse.isActive) {
        throw new BadRequestException(
          'Cannot place equipment in an inactive warehouse',
        );
      }
    }

    if (dto.warehouseLocationId) {
      const location = await this.warehouseLocationsRepository.findById(
        dto.warehouseLocationId,
      );

      if (!location) {
        throw new NotFoundException('Warehouse location not found');
      }

      if (!location.isActive) {
        throw new BadRequestException(
          'Cannot place equipment in an inactive warehouse location',
        );
      }

      if (!location.warehouse.isActive) {
        throw new BadRequestException(
          'Cannot place equipment in a location under an inactive warehouse',
        );
      }

      if (dto.warehouseId && location.warehouseId !== dto.warehouseId) {
        throw new BadRequestException(
          'Warehouse location does not belong to specified warehouse',
        );
      }
    }

    const equipmentItem = await this.prisma.$transaction(async (tx) => {
      return tx.equipmentItem.create({
        data: {
          assetTag: dto.assetTag,

          serialNumber: dto.serialNumber,

          equipmentName: dto.equipmentName,

          modelNumber: dto.modelNumber,

          description: dto.description,

          specifications: dto.specifications
            ? JSON.parse(dto.specifications)
            : undefined,

          purchaseDate: dto.purchaseDate
            ? new Date(dto.purchaseDate as string)
            : undefined,

          purchaseCost: dto.purchaseCost,

          currentValue: dto.currentValue,

          warrantyStartDate: dto.warrantyStartDate
            ? new Date(dto.warrantyStartDate as string)
            : undefined,

          warrantyEndDate: dto.warrantyEndDate
            ? new Date(dto.warrantyEndDate as string)
            : undefined,

          status: dto.status || EquipmentStatus.AVAILABLE,

          condition: dto.condition,

          isSerialized: dto.isSerialized,

          quantity: dto.quantity || 1,

          minimumStockLevel: dto.minimumStockLevel,

          reorderLevel: dto.reorderLevel,

          category: dto.categoryId
            ? {
                connect: {
                  id: dto.categoryId,
                },
              }
            : undefined,

          brand: dto.brandId
            ? {
                connect: {
                  id: dto.brandId,
                },
              }
            : undefined,

          vendor: dto.vendorId
            ? {
                connect: {
                  id: dto.vendorId,
                },
              }
            : undefined,

          warehouse: dto.warehouseId
            ? {
                connect: {
                  id: dto.warehouseId,
                },
              }
            : undefined,

          warehouseLocation: dto.warehouseLocationId
            ? {
                connect: {
                  id: dto.warehouseLocationId,
                },
              }
            : undefined,
        },

        include: {
          category: true,
          brand: true,
          vendor: true,
          warehouse: true,
          warehouseLocation: true,
        },
      });
    });

    await this.auditService.logActivity({
      action: 'CREATE_EQUIPMENT',

      entityType: 'EquipmentItem',

      entityId: equipmentItem.id,

      description: `Equipment ${equipmentItem.equipmentName} created`,

      newValues: equipmentItem,

      performedById: userId, // Set to null since this is called before user context is availabl
    });

    if (equipmentItem.quantity <= (equipmentItem.minimumStockLevel ?? 0)) {
      const warehouseManagerId = equipmentItem.warehouse?.managerId;

      if (warehouseManagerId) {
        await this.notificationsService.createNotification(
          warehouseManagerId,
          'Low Stock Alert',
          `${equipmentItem.equipmentName} is already below minimum stock level`,
          NotificationType.WARNING,
        );
      }
    }

    return {
      message: 'Equipment item created successfully',

      data: equipmentItem,
    };
  }

  async getInventoryItems(query: InventoryQueryDto) {
    const page = query.page || 1;

    const limit = query.limit || 10;

    const { skip, take } = buildPagination(page, limit);

    const where: Prisma.EquipmentItemWhereInput = {
      ...(query.search && {
        OR: [
          {
            equipmentName: {
              contains: query.search,
              mode: 'insensitive',
            },
          },

          {
            assetTag: {
              contains: query.search,
              mode: 'insensitive',
            },
          },

          {
            serialNumber: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        ],
      }),

      ...(query.warehouseId && {
        warehouseId: query.warehouseId,
      }),

      ...(query.categoryId && {
        categoryId: query.categoryId,
      }),

      ...(query.status && {
        status: query.status,
      }),

      ...(query.condition && {
        condition: query.condition,
      }),
    };

    const [items, total] = await Promise.all([
      this.inventoryRepository.findMany({
        where,

        skip,
        take,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          category: true,
          brand: true,
          vendor: true,

          warehouse: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },

          warehouseLocation: {
            select: {
              id: true,
              locationCode: true,
            },
          },

          _count: {
            select: {
              assignments: true,
              maintenanceRecords: true,
              stockMovements: true,
            },
          },
        },
      }),

      this.inventoryRepository.count(where),
    ]);

    return {
      message: 'Inventory items retrieved successfully',

      data: {
        items,

        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getEquipmentItemById(id: string) {
    const equipment = await this.inventoryRepository.findById(id);

    if (!equipment) {
      throw new NotFoundException('Equipment item not found');
    }

    return {
      message: 'Equipment item retrieved successfully',
      data: equipment,
    };
  }

  async updateEquipmentItem(
    id: string,
    dto: UpdateEquipmentItemDto,
    userId: string,
  ) {
    const equipment = await this.inventoryRepository.findById(id);

    if (!equipment) {
      throw new NotFoundException('Equipment item not found');
    }

    if (dto.assetTag && dto.assetTag !== equipment.assetTag) {
      const existingAsset = await this.inventoryRepository.findByAssetTag(
        dto.assetTag,
      );

      if (existingAsset) {
        throw new ConflictException('Asset tag already exists');
      }
    }

    if (dto.serialNumber && dto.serialNumber !== equipment.serialNumber) {
      const existingSerial = await this.inventoryRepository.findBySerialNumber(
        dto.serialNumber,
      );

      if (existingSerial) {
        throw new ConflictException('Serial number already exists');
      }
    }

    const isSerialized = dto.isSerialized ?? equipment.isSerialized;
    const quantity = dto.quantity ?? equipment.quantity;
    const serialNumber = dto.serialNumber ?? equipment.serialNumber;

    if (isSerialized && !serialNumber) {
      throw new BadRequestException(
        'Serialized equipment requires serial number',
      );
    }

    if (isSerialized && quantity > 1) {
      throw new BadRequestException(
        'Serialized equipment quantity cannot exceed 1',
      );
    }

    if (dto.categoryId) {
      const category = await this.categoriesRepository.findById(dto.categoryId);

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    if (dto.brandId) {
      const brand = await this.brandsRepository.findById(dto.brandId);

      if (!brand) {
        throw new NotFoundException('Brand not found');
      }
    }

    if (dto.vendorId) {
      const vendor = await this.vendorsRepository.findById(dto.vendorId);

      if (!vendor) {
        throw new NotFoundException('Vendor not found');
      }
    }

    const warehouseId = dto.warehouseId ?? equipment.warehouseId;

    if (warehouseId) {
      const warehouse = await this.warehousesRepository.findById(warehouseId);

      if (!warehouse) {
        throw new NotFoundException('Warehouse not found');
      }

      if (!warehouse.isActive) {
        throw new BadRequestException(
          'Cannot place equipment in an inactive warehouse',
        );
      }
    }

    if (dto.warehouseLocationId) {
      const location = await this.warehouseLocationsRepository.findById(
        dto.warehouseLocationId,
      );

      if (!location) {
        throw new NotFoundException('Warehouse location not found');
      }

      if (!location.isActive) {
        throw new BadRequestException(
          'Cannot place equipment in an inactive warehouse location',
        );
      }

      if (!location.warehouse.isActive) {
        throw new BadRequestException(
          'Cannot place equipment in a location under an inactive warehouse',
        );
      }

      if (warehouseId && location.warehouseId !== warehouseId) {
        throw new BadRequestException(
          'Warehouse location does not belong to specified warehouse',
        );
      }
    }

    const updatedEquipment = await this.inventoryRepository.update(id, {
      assetTag: dto.assetTag,
      serialNumber: dto.serialNumber,
      equipmentName: dto.equipmentName,
      modelNumber: dto.modelNumber,
      description: dto.description,
      specifications: dto.specifications
        ? JSON.parse(dto.specifications)
        : undefined,
      purchaseDate: dto.purchaseDate,
      purchaseCost: dto.purchaseCost,
      currentValue: dto.currentValue,
      warrantyStartDate: dto.warrantyStartDate,
      warrantyEndDate: dto.warrantyEndDate,
      status: dto.status,
      condition: dto.condition,
      isSerialized: dto.isSerialized,
      quantity: dto.quantity,
      minimumStockLevel: dto.minimumStockLevel,
      reorderLevel: dto.reorderLevel,
      category: dto.categoryId
        ? {
            connect: {
              id: dto.categoryId,
            },
          }
        : undefined,
      brand: dto.brandId
        ? {
            connect: {
              id: dto.brandId,
            },
          }
        : undefined,
      vendor: dto.vendorId
        ? {
            connect: {
              id: dto.vendorId,
            },
          }
        : undefined,
      warehouse: dto.warehouseId
        ? {
            connect: {
              id: dto.warehouseId,
            },
          }
        : undefined,
      warehouseLocation: dto.warehouseLocationId
        ? {
            connect: {
              id: dto.warehouseLocationId,
            },
          }
        : undefined,
    });

    await this.auditService.logActivity({
      action: 'UPDATE_EQUIPMENT',

      entityType: 'EquipmentItem',

      entityId: updatedEquipment.id,

      description: `Equipment ${updatedEquipment.equipmentName} updated`,

      oldValues: equipment,

      newValues: updatedEquipment,

      performedById: userId,
    });

    if (
      updatedEquipment.minimumStockLevel &&
      updatedEquipment.quantity <= updatedEquipment.minimumStockLevel
    ) {
      const warehouse = await this.warehousesRepository.findById(
        updatedEquipment.warehouseId!,
      );

      if (warehouse?.managerId) {
        await this.notificationsService.createNotification(
          warehouse.managerId,
          'Low Stock Alert',
          `${updatedEquipment.equipmentName} is below minimum stock level`,
          NotificationType.WARNING,
        );
      }
    }

    return {
      message: 'Equipment item updated successfully',
      data: updatedEquipment,
    };
  }

  async updateEquipmentStatus(
    id: string,
    dto: UpdateEquipmentStatusDto,
    userId: string,
  ) {
    const equipment = await this.inventoryRepository.findById(id);

    if (!equipment) {
      throw new NotFoundException('Equipment item not found');
    }

    const updatedEquipment = await this.inventoryRepository.update(id, {
      status: dto.status,
    });

    switch (dto.status) {
      case EquipmentStatus.MAINTENANCE:
        await this.notificationsService.createNotification(
          equipment.warehouse?.managerId as string,
          'Equipment Under Maintenance',
          `${equipment.equipmentName} has been moved to maintenance`,
          NotificationType.INFO,
        );
        break;

      case EquipmentStatus.RETIRED:
        await this.notificationsService.createNotification(
          equipment.warehouse?.managerId as string,
          'Equipment Retired',
          `${equipment.equipmentName} has been retired`,
          NotificationType.WARNING,
        );
        break;

      default:
        return;
    }

    await this.auditService.logActivity({
      action: 'UPDATE_EQUIPMENT_STATUS',

      entityType: 'EquipmentItem',

      entityId: updatedEquipment.id,

      description: `Status changed from ${equipment.status} to ${dto.status}`,

      oldValues: {
        status: equipment.status,
      },

      newValues: {
        status: dto.status,
      },
      performedById: userId,
    });

    return {
      message: 'Equipment status updated successfully',
      data: updatedEquipment,
    };
  }
}
