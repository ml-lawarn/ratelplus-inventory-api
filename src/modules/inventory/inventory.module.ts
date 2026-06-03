// src/modules/inventory/inventory.module.ts

import { Module } from '@nestjs/common';

import { CategoriesModule } from '../categories/categories.module';

import { BrandsModule } from '../brands/brands.module';

import { VendorsModule } from '../vendors/vendors.module';

import { WarehousesModule } from '../warehouses/warehouses.module';

import { WarehouseLocationsModule } from '../warehouse-locations/warehouse-locations.module';

import { InventoryController } from './controllers/inventory.controller';

import { InventoryService } from './services/inventory.service';

import { InventoryRepository } from './repositories/inventory.repository';

import { NotificationsModule } from '../notifications/notifications.module';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    CategoriesModule,
    BrandsModule,
    AuditModule,
    NotificationsModule,
    VendorsModule,
    WarehousesModule,
    WarehouseLocationsModule,
  ],

  controllers: [InventoryController],

  providers: [InventoryService, InventoryRepository],

  exports: [InventoryService, InventoryRepository],
})
export class InventoryModule {}
