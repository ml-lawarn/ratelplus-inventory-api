// src/modules/assignments/repositories/assignments.repository.ts

import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class AssignmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.EquipmentAssignmentCreateInput) {
    return this.prisma.equipmentAssignment.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.equipmentAssignment.findUnique({
      where: { id },

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
  }

  async findMany(params: Prisma.EquipmentAssignmentFindManyArgs) {
    return this.prisma.equipmentAssignment.findMany(params);
  }

  async count(where?: Prisma.EquipmentAssignmentWhereInput) {
    return this.prisma.equipmentAssignment.count({
      where,
    });
  }

  async update(id: string, data: Prisma.EquipmentAssignmentUpdateInput) {
    return this.prisma.equipmentAssignment.update({
      where: { id },
      data,
    });
  }
}
