// src/modules/notifications/notifications.module.ts

import { Module } from '@nestjs/common';

import { NotificationsRepository } from './repositories/notifications.repository';

import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';

import { EmailModule } from '../../infrastructure/email/email.module';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [EmailModule, UsersModule],
  controllers: [NotificationsController],

  providers: [NotificationsService, NotificationsRepository],

  exports: [NotificationsService],
})
export class NotificationsModule {}
