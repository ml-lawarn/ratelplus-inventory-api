// src/modules/notifications/repositories/notifications.repository.ts

import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.NotificationCreateInput) {
    return this.prisma.notification.create({
      data,
    });
  }

  async findMany(params: Prisma.NotificationFindManyArgs) {
    return this.prisma.notification.findMany(params);
  }

  async findFirst(params: Prisma.NotificationFindFirstArgs) {
    return this.prisma.notification.findFirst(params);
  }

  async count(where?: Prisma.NotificationWhereInput) {
    return this.prisma.notification.count({
      where,
    });
  }

  async update(id: string, data: Prisma.NotificationUpdateInput) {
    return this.prisma.notification.update({
      where: { id },
      data,
    });
  }

  async updateMany(params: Prisma.NotificationUpdateManyArgs) {
    return this.prisma.notification.updateMany(params);
  }
}
