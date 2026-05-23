// src/modules/notifications/services/notifications.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';

import { NotificationType } from '@prisma/client';

import { NotificationsRepository } from '../repositories/notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async createNotification(
    recipientId: string,

    title: string,

    message: string,

    type: NotificationType = NotificationType.INFO,
  ) {
    return this.notificationsRepository.create({
      title,
      message,
      type,

      recipient: {
        connect: {
          id: recipientId,
        },
      },
    });
  }

  async getUserNotifications(recipientId: string) {
    return this.notificationsRepository.findMany({
      where: {
        recipientId,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async markAsRead(id: string) {
    const notification = await this.notificationsRepository.update(id, {
      isRead: true,
      readAt: new Date(),
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return {
      message: 'Notification marked as read',

      data: notification,
    };
  }
}
