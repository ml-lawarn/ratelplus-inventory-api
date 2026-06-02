// src/modules/stock-movements/stock-movements.module.ts

import { Module } from '@nestjs/common';

import { InventoryModule } from '../inventory/inventory.module';

import { WarehouseLocationsModule } from '../warehouse-locations/warehouse-locations.module';

import { UsersModule } from '../users/users.module';

import { StockMovementsController } from './controllers/stock-movements.controller';

import { StockMovementsService } from './services/stock-movements.service';

import { StockMovementsRepository } from './repositories/stock-movements.repository';

@Module({
  imports: [InventoryModule, WarehouseLocationsModule, UsersModule],

  controllers: [StockMovementsController],

  providers: [StockMovementsService, StockMovementsRepository],

  exports: [StockMovementsService, StockMovementsRepository],
})
export class StockMovementsModule {}
