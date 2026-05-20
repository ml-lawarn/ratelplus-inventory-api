// src/modules/users/services/users.service.ts

import { ConflictException, Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { UsersRepository } from '../repositories/users.repository';

import { CreateUserDto } from '../dto/create-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';

import { hashPassword } from '../../../shared/utils/password.util';
import { buildPagination } from '../../../shared/utils/pagination.util';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(dto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.usersRepository.create({
      employeeCode: dto.employeeCode,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      role: dto.role,
      password: hashedPassword,

      department: dto.departmentId
        ? {
            connect: {
              id: dto.departmentId,
            },
          }
        : undefined,
    });

    return {
      message: 'User created successfully',
      data: user,
    };
  }

  async getUsers(query: UserQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const { skip, take } = buildPagination(page, limit);

    const where: Prisma.UserWhereInput = query.search
      ? {
          OR: [
            {
              firstName: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.usersRepository.findMany({
        where,
        skip,
        take,

        orderBy: {
          createdAt: 'desc',
        },

        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),

      this.usersRepository.count(where),
    ]);

    return {
      message: 'Users retrieved successfully',

      data: {
        items: users,

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
