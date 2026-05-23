// src/modules/audit/repositories/audit.repository.ts

import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AuditLogCreateInput) {
    return this.prisma.auditLog.create({
      data,
    });
  }

  async findMany(params: Prisma.AuditLogFindManyArgs) {
    return this.prisma.auditLog.findMany(params);
  }

  async count(where?: Prisma.AuditLogWhereInput) {
    return this.prisma.auditLog.count({
      where,
    });
  }
}
