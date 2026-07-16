// src/modules/audit/services/audit.service.ts

import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { buildPagination } from '../../../shared/utils/pagination.util';

import { AuditQueryDto } from '../dto/audit-query.dto';

import { CreateAuditLogDto } from '../dto/create-audit-log.dto';

import { AuditRepository } from '../repositories/audit.repository';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async logActivity(dto: CreateAuditLogDto) {
    return this.auditRepository.create({
      action: dto.action,

      entityType: dto.entityType,

      entityId: dto.entityId,

      description: dto.description,

      remarks: dto.remarks,

      ipAddress: dto.ipAddress,

      userAgent: dto.userAgent,

      oldValues: dto.oldValues,

      newValues: dto.newValues,

      performedBy: dto.performedById
        ? {
            connect: {
              id: dto.performedById,
            },
          }
        : undefined,
    });
  }

  async getAuditLogs(query: AuditQueryDto) {
    const page = query.page || 1;

    const limit = query.limit || 20;

    const search = query.search?.trim();

    const { skip, take } = buildPagination(page, limit);

    const where: Prisma.AuditLogWhereInput = {
      ...(query.action && {
        action: query.action,
      }),

      ...(query.entityType && {
        entityType: query.entityType,
      }),

      ...(query.performedById && {
        performedById: query.performedById,
      }),

      ...(search && {
        OR: [
          {
            entityId: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            remarks: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const [logs, total] = await Promise.all([
      this.auditRepository.findMany({
        where,

        skip,
        take,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          performedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),

      this.auditRepository.count(where),
    ]);

    return {
      message: 'Audit logs retrieved successfully',

      data: {
        items: logs,

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
