// src/modules/notifications/notifications.module.ts

import { Module } from '@nestjs/common';

import { NotificationsRepository } from './repositories/notifications.repository';

import { NotificationsService } from './services/notifications.service';

@Module({
  providers: [NotificationsService, NotificationsRepository],

  exports: [NotificationsService],
})
export class NotificationsModule {}
