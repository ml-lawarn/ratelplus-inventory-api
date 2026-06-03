// src/modules/warehouses/services/warehouses.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildPagination } from '../../../shared/utils/pagination.util';
import { UsersRepository } from '../../users/repositories/users.repository';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';
import { WarehouseQueryDto } from '../dto/warehouse-query.dto';
import { WarehousesRepository } from '../repositories/warehouses.repository';
import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class WarehousesService {
  constructor(
    private readonly warehousesRepository: WarehousesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createWarehouse(dto: CreateWarehouseDto) {
    const existingWarehouse = await this.warehousesRepository.findByCode(
      dto.code,
    );

    if (existingWarehouse) {
      throw new ConflictException('Warehouse code already exists');
    }

    if (dto.managerId) {
      const manager = await this.usersRepository.findById(dto.managerId);

      if (!manager) {
        throw new NotFoundException('Warehouse manager not found');
      }
    }

    const warehouse = await this.warehousesRepository.create({
      name: dto.name,
      code: dto.code,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      latitude: dto.latitude,
      longitude: dto.longitude,
      isActive: dto.isActive,
      manager: dto.managerId
        ? {
            connect: {
              id: dto.managerId,
            },
          }
        : undefined,
    });

    return {
      message: 'Warehouse created successfully',
      data: warehouse,
    };
  }

  async getWarehouses(query: WarehouseQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const { skip, take } = buildPagination(page, limit);

    const where: Prisma.WarehouseWhereInput = query.search
      ? {
          OR: [
            {
              name: {
                contains: query.search,
                mode: 'insensitive',
              },
            },

            {
              code: {
                contains: query.search,
                mode: 'insensitive',
              },
            },

            {
              city: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {};

    const [warehouses, total] = await Promise.all([
      this.warehousesRepository.findMany({
        where,
        skip,
        take,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },

          _count: {
            select: {
              locations: true,
              equipmentItems: true,
            },
          },
        },
      }),

      this.warehousesRepository.count(where),
    ]);

    return {
      message: 'Warehouses retrieved successfully',

      data: {
        items: warehouses,

        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getWarehouseById(id: string) {
    const warehouse = await this.warehousesRepository.findById(id);

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    return {
      message: 'Warehouse retrieved successfully',
      data: warehouse,
    };
  }

  async updateWarehouse(id: string, dto: UpdateWarehouseDto) {
    const warehouse = await this.warehousesRepository.findById(id);

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    if (dto.code && dto.code !== warehouse.code) {
      const existingWarehouse = await this.warehousesRepository.findByCode(
        dto.code,
      );

      if (existingWarehouse) {
        throw new ConflictException('Warehouse code already exists');
      }
    }

    if (dto.managerId) {
      const manager = await this.usersRepository.findById(dto.managerId);

      if (!manager) {
        throw new NotFoundException('Warehouse manager not found');
      }
    }

    const updatedWarehouse = await this.warehousesRepository.update(id, {
      name: dto.name,
      code: dto.code,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      latitude: dto.latitude,
      longitude: dto.longitude,
      isActive: dto.isActive,
      manager: dto.managerId
        ? {
            connect: {
              id: dto.managerId,
            },
          }
        : undefined,
    });

    return {
      message: 'Warehouse updated successfully',
      data: updatedWarehouse,
    };
  }

  async setActiveState(id: string, isActive: boolean) {
    const warehouse = await this.warehousesRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    if (!isActive) {
      // Check if warehouse has any items before deactivation
      const itemsCount = await this.prisma.equipmentItem.count({
        where: { warehouseId: id },
      });

      if (itemsCount > 0) {
        throw new ConflictException(
          `Cannot deactivate warehouse that contains ${itemsCount} equipment items. Please move items to another warehouse first.`,
        );
      }
    }

    const updated = await this.warehousesRepository.update(id, { isActive });
    return {
      message: `Warehouse ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updated,
    };
  }
}
