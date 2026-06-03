// src/modules/maintenance/services/maintenance.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  EquipmentStatus,
  MaintenanceStatus,
  NotificationType,
  Prisma,
} from '@prisma/client';

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

import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly maintenanceRepository: MaintenanceRepository,

    private readonly inventoryRepository: InventoryRepository,

    private readonly usersRepository: UsersRepository,

    private readonly vendorsRepository: VendorsRepository,

    private readonly auditService: AuditService,

    private readonly notificationsService: NotificationsService,
  ) {}

  async createMaintenanceRecord(
    dto: CreateMaintenanceRecordDto,
    userId: string,
  ) {
    let isMaintenanceScheduledOrInProgress = false;

    const equipment = await this.inventoryRepository.findById(
      dto.equipmentItemId,
    );

    if (!equipment) {
      throw new NotFoundException('Equipment item not found');
    }

    const createdBy = await this.usersRepository.findById(userId);

    if (!createdBy) {
      throw new NotFoundException('User not found');
    }

    if (!createdBy.isActive) {
      throw new BadRequestException(
        'Cannot record maintenance for deactivated user',
      );
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

          scheduledDate: new Date(dto.scheduledDate as string | Date),

          maintenanceStartDate: new Date(
            dto.maintenanceStartDate as string | Date,
          ),

          maintenanceEndDate: new Date(dto.maintenanceEndDate as string | Date),

          downtimeHours: dto.downtimeHours
            ? new Prisma.Decimal(dto.downtimeHours)
            : undefined,

          technicianName: dto.technicianName,

          technicianPhone: dto.technicianPhone,

          repairCost: dto.repairCost
            ? new Prisma.Decimal(dto.repairCost)
            : undefined,
          partsCost: dto.partsCost
            ? new Prisma.Decimal(dto.partsCost)
            : undefined,
          laborCost: dto.laborCost
            ? new Prisma.Decimal(dto.laborCost)
            : undefined,

          resolutionNotes: dto.resolutionNotes,

          nextMaintenanceDate: new Date(
            dto.nextMaintenanceDate as string | Date,
          ),

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
              id: userId,
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
        isMaintenanceScheduledOrInProgress = true;
        await tx.equipmentItem.update({
          where: {
            id: equipment.id,
          },

          data: {
            status: EquipmentStatus.MAINTENANCE,
          },
        });

        await this.notificationsService.createNotification(
          createdBy.id,
          'Maintenance Scheduled',
          `${equipment.equipmentName} has been scheduled for maintenance`,
          NotificationType.INFO,
        );
      }

      return record;
    });

    await this.auditService.logActivity({
      action: 'CREATE_MAINTENANCE',

      entityType: 'MaintenanceRecord',

      entityId: maintenanceRecord.id,

      description: `Maintenance recorded for ${equipment.equipmentName} by ${[createdBy.firstName, createdBy.lastName].filter(Boolean).join(' ') || createdBy.email}`,

      newValues: maintenanceRecord,

      performedById: userId,
    });

    if (!isMaintenanceScheduledOrInProgress) {
      await this.notificationsService.createNotification(
        createdBy.id,
        'Maintenance Record Created',
        `Maintenance record for ${equipment.equipmentName} has been created successfully`,
        NotificationType.INFO,
      );
    }

    return {
      message: 'Maintenance record created successfully',

      data: maintenanceRecord,
    };
  }

  async updateMaintenanceStatus(
    maintenanceId: string,
    dto: UpdateMaintenanceStatusDto,
    userId: string,
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

        await this.notificationsService.createNotification(
          updatedRecord.createdById,
          'Maintenance Completed',
          `Maintenance for ${equipment.equipmentName} has been completed`,
          NotificationType.SUCCESS,
        );
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

        await this.notificationsService.createNotification(
          updatedRecord.createdById,
          'Maintenance In Progress',
          `Maintenance for ${equipment.equipmentName} is now in progress`,
          NotificationType.INFO,
        );
      }

      return updatedRecord;
    });

    await this.auditService.logActivity({
      action: 'UPDATE_MAINTENANCE_STATUS',

      entityType: 'MaintenanceRecord',

      entityId: updatedMaintenance.id,

      description: `Maintenance status of ${equipment.equipmentName} updated to ${dto.maintenanceStatus} by ${[updatedMaintenance.createdBy.firstName, updatedMaintenance.createdBy.lastName].filter(Boolean).join(' ') || updatedMaintenance.createdBy.email}`,

      newValues: updatedMaintenance,

      performedById: userId,
    });

    return {
      message: 'Maintenance status updated successfully',

      data: updatedMaintenance,
    };
  }

  async getMaintenanceRecords(query: MaintenanceQueryDto) {
    const page = query.page || 1;

    const limit = query.limit || 10;

    const search = query.search?.trim();

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
          {
            vendor: {
              companyName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            equipmentItem: {
              category: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            resolutionNotes: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
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

  async getMaintenanceRecordById(id: string) {
    const record = await this.maintenanceRepository.findById(id);

    if (!record) {
      throw new NotFoundException('Maintenance record not found');
    }

    return {
      message: 'Maintenance record retrieved successfully',
      data: record,
    };
  }
}
