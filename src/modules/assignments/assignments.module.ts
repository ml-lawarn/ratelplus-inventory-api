// src/modules/assignments/assignments.module.ts

import { Module } from '@nestjs/common';

import { InventoryModule } from '../inventory/inventory.module';

import { UsersModule } from '../users/users.module';

import { AssignmentsController } from './controllers/assignments.controller';

import { AssignmentsService } from './services/assignments.service';

import { AssignmentsRepository } from './repositories/assignments.repository';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [InventoryModule, UsersModule, AuditModule],

  controllers: [AssignmentsController],

  providers: [AssignmentsService, AssignmentsRepository],

  exports: [AssignmentsService, AssignmentsRepository],
})
export class AssignmentsModule {}
