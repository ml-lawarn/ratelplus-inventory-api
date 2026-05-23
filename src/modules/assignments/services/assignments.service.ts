// src/modules/assignments/services/assignments.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AssignmentStatus, EquipmentStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

import { buildPagination } from '../../../shared/utils/pagination.util';

import { InventoryRepository } from '../../inventory/repositories/inventory.repository';

import { UsersRepository } from '../../users/repositories/users.repository';

import { CreateAssignmentDto } from '../dto/create-assignment.dto';

import { AssignmentQueryDto } from '../dto/assignment-query.dto';

import { ReturnAssignmentDto } from '../dto/return-assignment.dto';

import { AssignmentsRepository } from '../repositories/assignments.repository';

import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly assignmentsRepository: AssignmentsRepository,

    private readonly inventoryRepository: InventoryRepository,

    private readonly usersRepository: UsersRepository,

    private readonly auditService: AuditService,
  ) {}

  async createAssignment(dto: CreateAssignmentDto) {
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

    const assignedByUser = await this.usersRepository.findById(
      dto.assignedByUserId,
    );

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

    const newQuantity = equipment.quantity - assignedQuantity;

    const assignment = await this.prisma.$transaction(async (tx) => {
      await tx.equipmentItem.update({
        where: {
          id: equipment.id,
        },

        data: {
          quantity: newQuantity,

          status: equipment.isSerialized
            ? EquipmentStatus.DEPLOYED
            : equipment.status,
        },
      });

      return tx.equipmentAssignment.create({
        data: {
          expectedReturnDate: dto.expectedReturnDate,

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
              id: dto.assignedByUserId,
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

      performedById: dto.assignedByUserId,
    });

    return {
      message: 'Equipment assigned successfully',

      data: assignment,
    };
  }

  async returnAssignment(assignmentId: string, dto: ReturnAssignmentDto) {
    const assignment = await this.assignmentsRepository.findById(assignmentId);

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.assignmentStatus === AssignmentStatus.RETURNED) {
      throw new BadRequestException('Equipment already returned');
    }

    const equipment = assignment.equipmentItem;

    const restoredQuantity: number =
      Number(equipment.quantity) + Number(assignment.assignedQuantity);

    const updatedAssignment = await this.prisma.$transaction(async (tx) => {
      await tx.equipmentItem.update({
        where: {
          id: equipment.id,
        },

        data: {
          quantity: restoredQuantity,

          status: equipment.isSerialized
            ? EquipmentStatus.AVAILABLE
            : equipment.status,
        },
      });

      return tx.equipmentAssignment.update({
        where: {
          id: assignment.id,
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
    });

    await this.auditService.logActivity({
      action: 'RETURN_ASSIGNMENT',

      entityType: 'EquipmentAssignment',

      entityId: updatedAssignment.id,

      description: 'Equipment returned successfully',

      newValues: updatedAssignment,

      performedById: updatedAssignment.assignedByUser.id,
    });

    return {
      message: 'Equipment returned successfully',

      data: updatedAssignment,
    };
  }

  async getAssignments(query: AssignmentQueryDto) {
    const page = query.page || 1;

    const limit = query.limit || 10;

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
}
