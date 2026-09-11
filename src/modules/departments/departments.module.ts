// src/modules/departments/departments.module.ts

import { Module } from '@nestjs/common';

import { DepartmentsController } from './controllers/departments.controller';

import { DepartmentsService } from './services/departments.service';

import { DepartmentsRepository } from './repositories/departments.repository';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],

  controllers: [DepartmentsController],

  providers: [DepartmentsService, DepartmentsRepository],

  exports: [DepartmentsService, DepartmentsRepository],
})
export class DepartmentsModule {}
