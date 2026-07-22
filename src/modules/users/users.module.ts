// src/modules/users/users.module.ts

import { Module } from '@nestjs/common';

import { UsersController } from './controllers/users.controller';

import { UsersService } from './services/users.service';

import { UsersRepository } from './repositories/users.repository';

import { EmailModule } from '../../infrastructure/email/email.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [EmailModule, AuditModule],

  controllers: [UsersController],

  providers: [UsersService, UsersRepository],

  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
