// src/modules/warehouses/warehouses.module.ts

import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';

import { WarehousesController } from './controllers/warehouses.controller';

import { WarehousesService } from './services/warehouses.service';

import { WarehousesRepository } from './repositories/warehouses.repository';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [UsersModule, AuditModule],

  controllers: [WarehousesController],

  providers: [WarehousesService, WarehousesRepository],

  exports: [WarehousesService, WarehousesRepository],
})
export class WarehousesModule {}
