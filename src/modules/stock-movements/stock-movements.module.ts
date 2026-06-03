// src/modules/stock-movements/stock-movements.module.ts

import { Module } from '@nestjs/common';

import { InventoryModule } from '../inventory/inventory.module';

import { WarehouseLocationsModule } from '../warehouse-locations/warehouse-locations.module';

import { UsersModule } from '../users/users.module';

import { StockMovementsController } from './controllers/stock-movements.controller';

import { StockMovementsService } from './services/stock-movements.service';

import { StockMovementsRepository } from './repositories/stock-movements.repository';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    InventoryModule,
    WarehouseLocationsModule,
    UsersModule,
    AuditModule,
  ],

  controllers: [StockMovementsController],

  providers: [StockMovementsService, StockMovementsRepository],

  exports: [StockMovementsService, StockMovementsRepository],
})
export class StockMovementsModule {}
