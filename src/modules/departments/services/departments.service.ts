// src/modules/departments/services/departments.service.ts

import { ConflictException, Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { buildPagination } from '../../../shared/utils/pagination.util';

import { CreateDepartmentDto } from '../dto/create-department.dto';
import { DepartmentQueryDto } from '../dto/department-query.dto';

import { DepartmentsRepository } from '../repositories/departments.repository';

@Injectable()
export class DepartmentsService {
  constructor(private readonly departmentsRepository: DepartmentsRepository) {}

  async createDepartment(dto: CreateDepartmentDto) {
    const existingDepartment = await this.departmentsRepository.findByName(
      dto.name,
    );

    if (existingDepartment) {
      throw new ConflictException('Department already exists');
    }

    const department = await this.departmentsRepository.create({
      name: dto.name,
      description: dto.description,
    });

    return {
      message: 'Department created successfully',

      data: department,
    };
  }

  async getDepartments(query: DepartmentQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const { skip, take } = buildPagination(page, limit);

    const where: Prisma.DepartmentWhereInput = query.search
      ? {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        }
      : {};

    const [departments, total] = await Promise.all([
      this.departmentsRepository.findMany({
        where,
        skip,
        take,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
      }),

      this.departmentsRepository.count(where),
    ]);

    return {
      message: 'Departments retrieved successfully',

      data: {
        items: departments,

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
