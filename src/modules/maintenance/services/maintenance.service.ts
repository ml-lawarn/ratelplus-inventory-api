// src/modules/maintenance/services/maintenance.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EquipmentStatus, MaintenanceStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

import { buildPagination } from '../../../shared/utils/pagination.util';

import { InventoryRepository } from '../../inventory/repositories/inventory.repository';

import { UsersRepository } from '../../users/repositories/users.repository';

import { VendorsRepository } from '../../vendors/repositories/vendors.repository';

import { CreateMaintenanceRecordDto } from '../dto/create-maintenance-record.dto';

import { MaintenanceQueryDto } from '../dto/maintenance-query.dto';

import { UpdateMaintenanceStatusDto } from '../dto/update-maintenance-status.dto';

import { MaintenanceRepository } from '../repositories/maintenance.repository';

import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly maintenanceRepository: MaintenanceRepository,

    private readonly inventoryRepository: InventoryRepository,

    private readonly usersRepository: UsersRepository,

    private readonly vendorsRepository: VendorsRepository,
    private readonly auditService: AuditService,
  ) {}

  async createMaintenanceRecord(dto: CreateMaintenanceRecordDto) {
    const equipment = await this.inventoryRepository.findById(
      dto.equipmentItemId,
    );

    if (!equipment) {
      throw new NotFoundException('Equipment item not found');
    }

    const createdBy = await this.usersRepository.findById(dto.createdById);

    if (!createdBy) {
      throw new NotFoundException('User not found');
    }

    if (dto.vendorId) {
      const vendor = await this.vendorsRepository.findById(dto.vendorId);

      if (!vendor) {
        throw new NotFoundException('Vendor not found');
      }
    }

    const maintenanceRecord = await this.prisma.$transaction(async (tx) => {
      const record = await tx.maintenanceRecord.create({
        data: {
          maintenanceType: dto.maintenanceType,

          issueDescription: dto.issueDescription,

          maintenanceStatus:
            dto.maintenanceStatus || MaintenanceStatus.SCHEDULED,

          priority: dto.priority,

          scheduledDate: dto.scheduledDate,

          maintenanceStartDate: dto.maintenanceStartDate,

          maintenanceEndDate: dto.maintenanceEndDate,

          downtimeHours: dto.downtimeHours,

          technicianName: dto.technicianName,

          technicianPhone: dto.technicianPhone,

          repairCost: dto.repairCost,

          partsCost: dto.partsCost,

          laborCost: dto.laborCost,

          resolutionNotes: dto.resolutionNotes,

          nextMaintenanceDate: dto.nextMaintenanceDate,

          equipmentItem: {
            connect: {
              id: dto.equipmentItemId,
            },
          },

          vendor: dto.vendorId
            ? {
                connect: {
                  id: dto.vendorId,
                },
              }
            : undefined,

          createdBy: {
            connect: {
              id: dto.createdById,
            },
          },
        },

        include: {
          equipmentItem: true,

          vendor: true,

          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (
        dto.maintenanceStatus === MaintenanceStatus.IN_PROGRESS ||
        dto.maintenanceStatus === MaintenanceStatus.SCHEDULED
      ) {
        await tx.equipmentItem.update({
          where: {
            id: equipment.id,
          },

          data: {
            status: EquipmentStatus.MAINTENANCE,
          },
        });
      }

      return record;
    });

    await this.auditService.logActivity({
      action: 'CREATE_MAINTENANCE',

      entityType: 'MaintenanceRecord',

      entityId: maintenanceRecord.id,

      description: 'Maintenance record created',

      newValues: maintenanceRecord,

      performedById: dto.createdById,
    });

    return {
      message: 'Maintenance record created successfully',

      data: maintenanceRecord,
    };
  }

  async updateMaintenanceStatus(
    maintenanceId: string,
    dto: UpdateMaintenanceStatusDto,
  ) {
    const maintenance =
      await this.maintenanceRepository.findById(maintenanceId);

    if (!maintenance) {
      throw new NotFoundException('Maintenance record not found');
    }

    const equipment = maintenance.equipmentItem;

    const updatedMaintenance = await this.prisma.$transaction(async (tx) => {
      const updatedRecord = await tx.maintenanceRecord.update({
        where: {
          id: maintenance.id,
        },

        data: {
          maintenanceStatus: dto.maintenanceStatus,

          maintenanceStartDate: dto.maintenanceStartDate,

          maintenanceEndDate: dto.maintenanceEndDate,

          resolutionNotes: dto.resolutionNotes,
        },

        include: {
          equipmentItem: true,

          vendor: true,

          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (dto.maintenanceStatus === MaintenanceStatus.COMPLETED) {
        await tx.equipmentItem.update({
          where: {
            id: equipment.id,
          },

          data: {
            status: EquipmentStatus.AVAILABLE,
          },
        });
      }

      if (dto.maintenanceStatus === MaintenanceStatus.IN_PROGRESS) {
        await tx.equipmentItem.update({
          where: {
            id: equipment.id,
          },

          data: {
            status: EquipmentStatus.MAINTENANCE,
          },
        });
      }

      return updatedRecord;
    });

    await this.auditService.logActivity({
      action: 'UPDATE_MAINTENANCE_STATUS',

      entityType: 'MaintenanceRecord',

      entityId: updatedMaintenance.id,

      description: `Maintenance status updated to ${dto.maintenanceStatus}`,

      newValues: updatedMaintenance,
    });

    return {
      message: 'Maintenance status updated successfully',

      data: updatedMaintenance,
    };
  }

  async getMaintenanceRecords(query: MaintenanceQueryDto) {
    const page = query.page || 1;

    const limit = query.limit || 10;

    const { skip, take } = buildPagination(page, limit);

    const where: Prisma.MaintenanceRecordWhereInput = {
      ...(query.equipmentItemId && {
        equipmentItemId: query.equipmentItemId,
      }),

      ...(query.maintenanceStatus && {
        maintenanceStatus: query.maintenanceStatus,
      }),

      ...(query.priority && {
        priority: query.priority,
      }),
    };

    const [records, total] = await Promise.all([
      this.maintenanceRepository.findMany({
        where,

        skip,
        take,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          equipmentItem: {
            select: {
              id: true,
              assetTag: true,
              equipmentName: true,
              serialNumber: true,
            },
          },

          vendor: {
            select: {
              id: true,
              companyName: true,
            },
          },

          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),

      this.maintenanceRepository.count(where),
    ]);

    return {
      message: 'Maintenance records retrieved successfully',

      data: {
        items: records,

        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }
}
