// src/modules/warehouse-locations/services/warehouse-locations.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { buildPagination } from '../../../shared/utils/pagination.util';

import { WarehousesRepository } from '../../warehouses/repositories/warehouses.repository';

import { CreateWarehouseLocationDto } from '../dto/create-warehouse-location.dto';
import { UpdateWarehouseLocationDto } from '../dto/update-warehouse-location.dto';

import { WarehouseLocationQueryDto } from '../dto/warehouse-location-query.dto';

import { WarehouseLocationsRepository } from '../repositories/warehouse-locations.repository';

import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class WarehouseLocationsService {
  constructor(
    private readonly warehouseLocationsRepository: WarehouseLocationsRepository,

    private readonly warehousesRepository: WarehousesRepository,

    private readonly auditService: AuditService,
  ) {}

  async createWarehouseLocation(
    dto: CreateWarehouseLocationDto,
    userId: string,
  ) {
    const warehouse = await this.warehousesRepository.findById(dto.warehouseId);

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    if (!warehouse.isActive) {
      throw new ConflictException(
        'Cannot create location in an inactive warehouse',
      );
    }

    const existingLocation =
      await this.warehouseLocationsRepository.findByWarehouseAndCode(
        dto.warehouseId,
        dto.locationCode,
      );

    if (existingLocation) {
      throw new ConflictException(
        'Location code already exists in this warehouse',
      );
    }

    const warehouseLocation = await this.warehouseLocationsRepository.create({
      locationCode: dto.locationCode,

      room: dto.room,
      aisle: dto.aisle,
      rack: dto.rack,
      shelf: dto.shelf,
      bin: dto.bin,

      description: dto.description,

      isActive: dto.isActive,

      warehouse: {
        connect: {
          id: dto.warehouseId,
        },
      },
    });

    await this.auditService.logActivity({
      action: 'CREATE_WAREHOUSE_LOCATION',
      entityType: 'WarehouseLocation',
      entityId: warehouseLocation.id,
      description: `Warehouse location ${warehouseLocation.locationCode} created`,
      newValues: warehouseLocation,
      performedById: userId,
    });

    return {
      message: 'Warehouse location created successfully',

      data: warehouseLocation,
    };
  }

  async getWarehouseLocations(query: WarehouseLocationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const { skip, take } = buildPagination(page, limit);

    const where: Prisma.WarehouseLocationWhereInput = {
      ...(query.warehouseId && {
        warehouseId: query.warehouseId,
      }),

      ...(query.search && {
        OR: [
          {
            locationCode: {
              contains: query.search,
              mode: 'insensitive',
            },
          },

          {
            room: {
              contains: query.search,
              mode: 'insensitive',
            },
          },

          {
            shelf: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const [locations, total] = await Promise.all([
      this.warehouseLocationsRepository.findMany({
        where,
        skip,
        take,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          warehouse: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },

          _count: {
            select: {
              equipmentItems: true,
            },
          },
        },
      }),

      this.warehouseLocationsRepository.count(where),
    ]);

    return {
      message: 'Warehouse locations retrieved successfully',

      data: {
        items: locations,

        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getWarehouseLocationById(id: string) {
    const location = await this.warehouseLocationsRepository.findById(id);

    if (!location) {
      throw new NotFoundException('Warehouse location not found');
    }

    return {
      message: 'Warehouse location retrieved successfully',
      data: location,
    };
  }

  async updateWarehouseLocation(
    id: string,
    dto: UpdateWarehouseLocationDto,
    userId: string,
  ) {
    const location = await this.warehouseLocationsRepository.findById(id);

    if (!location) {
      throw new NotFoundException('Warehouse location not found');
    }

    const warehouseId = dto.warehouseId ?? location.warehouseId;
    const warehouse = await this.warehousesRepository.findById(warehouseId);

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    if (!warehouse.isActive) {
      throw new ConflictException(
        'Cannot move location to an inactive warehouse',
      );
    }

    if (
      dto.locationCode &&
      (dto.locationCode !== location.locationCode ||
        warehouseId !== location.warehouseId)
    ) {
      const existingLocation =
        await this.warehouseLocationsRepository.findByWarehouseAndCode(
          warehouseId,
          dto.locationCode,
        );

      if (existingLocation && existingLocation.id !== id) {
        throw new ConflictException(
          'Location code already exists in this warehouse',
        );
      }
    }

    const updatedLocation = await this.warehouseLocationsRepository.update(id, {
      locationCode: dto.locationCode,
      room: dto.room,
      aisle: dto.aisle,
      rack: dto.rack,
      shelf: dto.shelf,
      bin: dto.bin,
      description: dto.description,
      isActive: dto.isActive,
      warehouse: dto.warehouseId
        ? {
            connect: {
              id: dto.warehouseId,
            },
          }
        : undefined,
    });

    await this.auditService.logActivity({
      action: 'UPDATE_WAREHOUSE_LOCATION',
      entityType: 'WarehouseLocation',
      entityId: updatedLocation.id,
      description: `Warehouse location ${updatedLocation.locationCode} updated`,
      oldValues: location,
      newValues: updatedLocation,
      performedById: userId,
    });

    return {
      message: 'Warehouse location updated successfully',
      data: updatedLocation,
    };
  }
}
