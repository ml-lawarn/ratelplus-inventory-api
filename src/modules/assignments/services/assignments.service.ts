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

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly assignmentsRepository: AssignmentsRepository,

    private readonly inventoryRepository: InventoryRepository,

    private readonly usersRepository: UsersRepository,

    private readonly auditService: AuditService,

    private readonly notificationsService: NotificationsService,
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

          equipmentItem: {
            connect: {
              id: equipment.id,
            },
          },

          assignedToUser: {
            connect: {
              id: dto.assignedToUserId,
            },
          },

          assignedByUser: {
            connect: {
              id: userId,
            },
          },
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

    await this.auditService.logActivity({
      action: 'CREATE_ASSIGNMENT',

      entityType: 'EquipmentAssignment',

      entityId: assignment.id,

      description: `Equipment assigned to user ${assignment.assignedToUser.email}`,

      newValues: assignment,

      performedById: userId,
    });

    await this.notificationsService.createNotification(
      assignment.assignedToUserId,
      'Equipment Assigned',
      `You have been assigned ${assignment.equipmentItem.equipmentName}`,
      NotificationType.SUCCESS,
    );

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

      description: 'Equipment returned successfully',

      newValues: updatedAssignment,

      performedById: userId,
    });

    await this.notificationsService.createNotification(
      updatedAssignment.assignedToUserId,
      'Equipment Returned',
      `${updatedAssignment.equipmentItem.equipmentName} has been returned successfully`,
      NotificationType.INFO,
    );

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
