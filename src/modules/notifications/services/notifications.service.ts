// src/modules/notifications/services/notifications.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';

import { NotificationType } from '@prisma/client';
import { Prisma } from '@prisma/client';

// import { EmailService } from '../../../infrastructure/email/email.service';
// import { UsersRepository } from '../../users/repositories/users.repository';

import { buildPagination } from '../../../shared/utils/pagination.util';

import { NotificationsRepository } from '../repositories/notifications.repository';
import { NotificationQueryDto } from '../dto/notification-query.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    // private readonly emailService: EmailService,
    // private readonly usersRepository: UsersRepository,
  ) {}

  async createNotification(
    recipientId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
  ) {
    const notification = await this.notificationsRepository.create({
      title,
      message,
      type,

      recipient: {
        connect: {
          id: recipientId,
        },
      },
    });

    // const recipient = await this.usersRepository.findById(recipientId);

    // if (recipient?.email) {
    //   try {
    //     void this.emailService.sendEmail({
    //       to: recipient.email,

    //       subject: title,

    //       html: `
    //       <h2>${title}</h2>
    //       <p>${message}</p>
    //     `,
    //     });
    //   } catch (error) {
    //     console.error('Failed to send notification email', error);
    //   }
    // }

    return notification;
  }

  async getUserNotifications(recipientId: string, query: NotificationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search?.trim();

    const { skip, take } = buildPagination(page, limit);

    const where: Prisma.NotificationWhereInput = {
      recipientId,
      ...(query.isRead !== undefined && {
        isRead: query.isRead,
      }),
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            message: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const [notifications, total] = await Promise.all([
      this.notificationsRepository.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.notificationsRepository.count(where),
    ]);

    return {
      message: 'Notifications retrieved successfully',
      data: {
        items: notifications,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async markAsRead(id: string, recipientId: string) {
    const existingNotification = await this.notificationsRepository.findFirst({
      where: {
        id,
        recipientId,
      },
    });

    if (!existingNotification) {
      throw new NotFoundException('Notification not found');
    }

    const notification = await this.notificationsRepository.update(id, {
      isRead: true,
      readAt: new Date(),
    });

    return {
      message: 'Notification marked as read',

      data: notification,
    };
  }

  async markAllAsRead(recipientId: string) {
    const result = await this.notificationsRepository.updateMany({
      where: {
        recipientId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      message: 'Notifications marked as read',
      data: {
        updatedCount: result.count,
      },
    };
  }
}
