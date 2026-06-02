// src/modules/brands/repositories/brands.repository.ts

import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class BrandsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.BrandCreateInput) {
    return this.prisma.brand.create({
      data,
    });
  }

  async findByName(name: string) {
    return this.prisma.brand.findUnique({
      where: { name },
    });
  }

  async findById(id: string) {
    return this.prisma.brand.findUnique({
      where: { id },
    });
  }

  async findMany(params: Prisma.BrandFindManyArgs) {
    return this.prisma.brand.findMany(params);
  }

  async count(where?: Prisma.BrandWhereInput) {
    return this.prisma.brand.count({
      where,
    });
  }

  async update(id: string, data: Prisma.BrandUpdateInput) {
    return this.prisma.brand.update({
      where: { id },
      data,
    });
  }
}
