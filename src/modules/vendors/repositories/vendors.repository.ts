// src/modules/vendors/repositories/vendors.repository.ts

import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class VendorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.VendorCreateInput) {
    return this.prisma.vendor.create({
      data,
    });
  }

  async findByName(companyName: string) {
    return this.prisma.vendor.findUnique({
      where: { companyName },
    });
  }

  async findById(id: string) {
    return this.prisma.vendor.findUnique({
      where: { id },
    });
  }

  async findMany(params: Prisma.VendorFindManyArgs) {
    return this.prisma.vendor.findMany(params);
  }

  async count(where?: Prisma.VendorWhereInput) {
    return this.prisma.vendor.count({
      where,
    });
  }

  async update(id: string, data: Prisma.VendorUpdateInput) {
    return this.prisma.vendor.update({
      where: { id },
      data,
    });
  }
}
