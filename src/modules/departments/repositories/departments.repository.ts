// src/modules/departments/repositories/departments.repository.ts

import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class DepartmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.DepartmentCreateInput) {
    return this.prisma.department.create({
      data,
    });
  }

  async findByName(name: string) {
    return this.prisma.department.findUnique({
      where: { name },
    });
  }

  async findById(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
    });
  }

  async findMany(params: Prisma.DepartmentFindManyArgs) {
    return this.prisma.department.findMany(params);
  }

  async count(where?: Prisma.DepartmentWhereInput) {
    return this.prisma.department.count({
      where,
    });
  }

  async update(id: string, data: Prisma.DepartmentUpdateInput) {
    return this.prisma.department.update({
      where: { id },
      data,
    });
  }
}
