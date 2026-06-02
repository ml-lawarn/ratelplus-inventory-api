// src/modules/users/repositories/users.repository.ts

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../core/database/prisma.service';

import { Prisma } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        department: {
          select: { name: true },
        },
      },
    });
  }

  async findMany(params: Prisma.UserFindManyArgs) {
    return this.prisma.user.findMany(params);
  }

  async count(where?: Prisma.UserWhereInput) {
    return this.prisma.user.count({
      where,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
