// src/modules/assignments/services/assignments.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  AssignmentStatus,
  EquipmentStatus,
  NotificationType,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

import { buildPagination } from '../../../shared/utils/pagination.util';

import { InventoryRepository } from '../../inventory/repositories/inventory.repository';

import { UsersRepository } from '../../users/repositories/users.repository';

import { CreateAssignmentDto } from '../dto/create-assignment.dto';

import { AssignmentQueryDto } from '../dto/assignment-query.dto';

import { ReturnAssignmentDto } from '../dto/return-assignment.dto';

import { AssignmentsRepository } from '../repositories/assignments.repository';

import { AuditService } from '../../audit/services/audit.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { EmailService } from '../../../infrastructure/email/email.service';
import { assignmentEmailTemplate } from '../../../infrastructure/email/templates/assignment-email.template';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly assignmentsRepository: AssignmentsRepository,

    private readonly inventoryRepository: InventoryRepository,

    private readonly usersRepository: UsersRepository,

    private readonly auditService: AuditService,

    private readonly notificationsService: NotificationsService,

    private readonly emailService: EmailService,
  ) {}

  async createAssignment(dto: CreateAssignmentDto, userId: string) {
    const equipment = await this.inventoryRepository.findById(
      dto.equipmentItemId,
    );

    if (!equipment) {
      throw new NotFoundException('Equipment item not found');
    }

    const assignedToUser = await this.usersRepository.findById(
      dto.assignedToUserId,
    );

    if (!assignedToUser) {
      throw new NotFoundException('Assigned user not found');
    }

    if (!assignedToUser.isActive) {
      throw new BadRequestException(
        'Cannot assign equipment to a deactivated user',
      );
    }

    const assignedByUser = await this.usersRepository.findById(userId);

    if (!assignedByUser) {
      throw new NotFoundException('Assigning user not found');
    }

    const assignedQuantity = dto.assignedQuantity || 1;

    if (equipment.quantity < assignedQuantity) {
      throw new BadRequestException('Insufficient inventory quantity');
    }

    if (equipment.isSerialized && assignedQuantity > 1) {
      throw new BadRequestException(
        'Serialized equipment cannot be assigned in bulk',
      );
    }

    if (equipment.status === EquipmentStatus.RETIRED) {
      throw new BadRequestException('Retired equipment cannot be assigned');
    }

    const assignment = await this.prisma.$transaction(async (tx) => {
      // 1. Decrement quantity from InventoryBalance at the source location
      if (dto.sourceLocationId) {
        let balance = await (tx as any).inventoryBalance.findUnique({
          where: {
            equipmentItemId_warehouseLocationId: {
              equipmentItemId: equipment.id,
              warehouseLocationId: dto.sourceLocationId,
            },
          },
        });

        // Initialize balance if it doesn't exist but item is at this location
        if (
          !balance &&
          equipment.warehouseLocationId === dto.sourceLocationId
        ) {
          balance = await (tx as any).inventoryBalance.create({
            data: {
              equipmentItemId: equipment.id,
              warehouseLocationId: dto.sourceLocationId,
              warehouseId: equipment.warehouseId,
              quantity: equipment.quantity,
            },
          });
        }

        if (!balance || balance.quantity < assignedQuantity) {
          throw new BadRequestException(
            `Insufficient quantity at the selected source location. Available: ${balance?.quantity || 0}`,
          );
        }

        await (tx as any).inventoryBalance.update({
          where: { id: balance.id },
          data: { quantity: { decrement: assignedQuantity } },
        });
      } else {
        // If no source location provided, try to find ANY balance that has enough
        let balances = await (tx as any).inventoryBalance.findMany({
          where: {
            equipmentItemId: equipment.id,
            quantity: { gte: assignedQuantity },
          },
        });

        // If no balances found, check if the main equipment record has enough (legacy)
        if (
          balances.length === 0 &&
          equipment.warehouseLocationId &&
          equipment.quantity >= assignedQuantity
        ) {
          const newBalance = await (tx as any).inventoryBalance.create({
            data: {
              equipmentItemId: equipment.id,
              warehouseLocationId: equipment.warehouseLocationId,
              warehouseId: equipment.warehouseId,
              quantity: equipment.quantity,
            },
          });
          balances = [newBalance];
        }

        if (balances.length === 0) {
          throw new BadRequestException(
            'No location has sufficient quantity for this deployment',
          );
        }

        // Take from the first available location
        await (tx as any).inventoryBalance.update({
          where: { id: balances[0].id },
          data: { quantity: { decrement: assignedQuantity } },
        });

        // Use this location as sourceLocationId
        dto.sourceLocationId = balances[0].warehouseLocationId;
      }

      // 2. Update total quantity in EquipmentItem
      try {
        await tx.equipmentItem.update({
          where: {
            id: equipment.id,
            quantity: {
              gte: assignedQuantity,
            },
            NOT: {
              status: EquipmentStatus.RETIRED,
            },
          },
          data: {
            quantity: {
              decrement: assignedQuantity,
            },
            status: equipment.isSerialized
              ? EquipmentStatus.DEPLOYED
              : undefined,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          throw new BadRequestException(
            'Insufficient inventory quantity or asset state has changed',
          );
        }
        throw error;
      }

      return tx.equipmentAssignment.create({
        data: {
          expectedReturnDate: new Date(dto.expectedReturnDate as string | Date),

          remarks: dto.remarks,

          assignedQuantity,

          equipmentItemId: equipment.id,

          sourceLocationId: dto.sourceLocationId || null,

          assignedToUserId: dto.assignedToUserId,

          assignedByUserId: userId,
        },

        include: {
          equipmentItem: true,

          assignedToUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },

          assignedByUser: {
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

    const assignedToName =
      [assignment.assignedToUser.firstName, assignment.assignedToUser.lastName]
        .filter(Boolean)
        .join(' ') || assignment.assignedToUser.email;

    await this.auditService.logActivity({
      action: 'CREATE_ASSIGNMENT',

      entityType: 'EquipmentAssignment',

      entityId: assignment.id,

      description: `Assigned ${assignment.equipmentItem.equipmentName} (${assignment.equipmentItem.assetTag}) to ${assignedToName}`,

      newValues: assignment,

      performedById: userId,
    });

    await this.notificationsService.createNotification(
      assignment.assignedToUserId,
      'Equipment Assigned',
      `You have been assigned ${assignment.equipmentItem.equipmentName}`,
      NotificationType.SUCCESS,
    );

    void this.emailService.sendEmail({
      to: assignment.assignedToUser.email,
      subject: 'Equipment Assigned',
      html: assignmentEmailTemplate(
        assignment.equipmentItem.equipmentName,
        assignment.equipmentItem.assetTag,
        assignedToName,
        'ASSIGNED',
        assignment.expectedReturnDate?.toLocaleDateString(),
      ),
    });

    return {
      message: 'Equipment assigned successfully',

      data: assignment,
    };
  }

  async returnAssignment(
    assignmentId: string,
    dto: ReturnAssignmentDto,
    userId: string,
  ) {
    const assignment = await this.assignmentsRepository.findById(assignmentId);

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.assignmentStatus === AssignmentStatus.RETURNED) {
      throw new BadRequestException('Equipment already returned');
    }

    const equipment = assignment.equipmentItem;

    const updatedAssignment = await this.prisma.$transaction(async (tx) => {
      try {
        const updated = await tx.equipmentAssignment.update({
          where: {
            id: assignment.id,
            assignmentStatus: AssignmentStatus.ASSIGNED,
          },
          data: {
            assignmentStatus: AssignmentStatus.RETURNED,

            actualReturnDate: new Date(),

            remarks: dto.remarks ? dto.remarks : assignment.remarks,
          },
          include: {
            equipmentItem: true,

            assignedToUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },

            assignedByUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        await tx.equipmentItem.update({
          where: {
            id: equipment.id,
          },
          data: {
            quantity: {
              increment: assignment.assignedQuantity,
            },
            status: equipment.isSerialized
              ? EquipmentStatus.AVAILABLE
              : undefined,
          },
        });

        // 3. Increment quantity back to the source InventoryBalance
        if ((assignment as any).sourceLocationId) {
          const location = await tx.warehouseLocation.findUnique({
            where: { id: (assignment as any).sourceLocationId },
            select: { warehouseId: true },
          });

          await (tx as any).inventoryBalance.upsert({
            where: {
              equipmentItemId_warehouseLocationId: {
                equipmentItemId: equipment.id,
                warehouseLocationId: (assignment as any).sourceLocationId,
              },
            },
            update: { quantity: { increment: assignment.assignedQuantity } },
            create: {
              equipmentItemId: equipment.id,
              warehouseLocationId: (assignment as any).sourceLocationId,
              warehouseId: location?.warehouseId || '',
              quantity: assignment.assignedQuantity,
            },
          });
        }

        return updated;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          throw new BadRequestException(
            'Equipment already returned or assignment is not active',
          );
        }
        throw error;
      }
    });

    await this.auditService.logActivity({
      action: 'RETURN_ASSIGNMENT',

      entityType: 'EquipmentAssignment',

      entityId: updatedAssignment.id,

      description: `Equipment ${updatedAssignment.equipmentItem.equipmentName} returned successfully by ${[updatedAssignment.assignedToUser.firstName, updatedAssignment.assignedToUser.lastName].filter(Boolean).join(' ') || updatedAssignment.assignedToUser.email}`,

      newValues: updatedAssignment,

      performedById: userId,
    });

    await this.notificationsService.createNotification(
      updatedAssignment.assignedToUserId,
      'Equipment Returned',
      `${updatedAssignment.equipmentItem.equipmentName} has been returned successfully`,
      NotificationType.INFO,
    );

    void this.emailService.sendEmail({
      to: updatedAssignment.assignedToUser.email,
      subject: 'Equipment Returned',
      html: assignmentEmailTemplate(
        updatedAssignment.equipmentItem.equipmentName,
        updatedAssignment.equipmentItem.assetTag,
        [
          updatedAssignment.assignedToUser.firstName,
          updatedAssignment.assignedToUser.lastName,
        ]
          .filter(Boolean)
          .join(' ') || updatedAssignment.assignedToUser.email,
        'RETURNED',
      ),
    });

    return {
      message: 'Equipment returned successfully',

      data: updatedAssignment,
    };
  }

  async getAssignments(query: AssignmentQueryDto) {
    const page = query.page || 1;

    const limit = query.limit || 10;
    const search = query.search?.trim();

    const { skip, take } = buildPagination(page, limit);

    const where: Prisma.EquipmentAssignmentWhereInput = {
      ...(query.assignedToUserId && {
        assignedToUserId: query.assignedToUserId,
      }),

      ...(query.equipmentItemId && {
        equipmentItemId: query.equipmentItemId,
      }),

      ...(query.assignmentStatus && {
        assignmentStatus: query.assignmentStatus,
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
            assignedToUser: {
              firstName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            assignedToUser: {
              lastName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ],
      }),
    };

    const [assignments, total] = await Promise.all([
      this.assignmentsRepository.findMany({
        where,

        skip,
        take,

        orderBy: {
          checkoutDate: 'desc',
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

          assignedToUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },

          assignedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),

      this.assignmentsRepository.count(where),
    ]);

    return {
      message: 'Assignments retrieved successfully',

      data: {
        items: assignments,

        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getAssignmentById(id: string) {
    const assignment = await this.assignmentsRepository.findById(id);

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return {
      message: 'Assignment retrieved successfully',
      data: assignment,
    };
  }
}
