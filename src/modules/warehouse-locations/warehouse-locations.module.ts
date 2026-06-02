// src/modules/warehouse-locations/warehouse-locations.module.ts

import { Module } from '@nestjs/common';

import { WarehousesModule } from '../warehouses/warehouses.module';

import { WarehouseLocationsController } from './controllers/warehouse-locations.controller';

import { WarehouseLocationsService } from './services/warehouse-locations.service';

import { WarehouseLocationsRepository } from './repositories/warehouse-locations.repository';

@Module({
  imports: [WarehousesModule],

  controllers: [WarehouseLocationsController],

  providers: [WarehouseLocationsService, WarehouseLocationsRepository],

  exports: [WarehouseLocationsService, WarehouseLocationsRepository],
})
export class WarehouseLocationsModule {}
