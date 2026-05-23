// src/modules/maintenance/maintenance.module.ts

import { Module } from '@nestjs/common';

import { InventoryModule } from '../inventory/inventory.module';

import { UsersModule } from '../users/users.module';

import { VendorsModule } from '../vendors/vendors.module';

import { MaintenanceController } from './controllers/maintenance.controller';

import { MaintenanceService } from './services/maintenance.service';

import { MaintenanceRepository } from './repositories/maintenance.repository';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [InventoryModule, UsersModule, VendorsModule, AuditModule],

  controllers: [MaintenanceController],

  providers: [MaintenanceService, MaintenanceRepository],

  exports: [MaintenanceService, MaintenanceRepository],
})
export class MaintenanceModule {}
