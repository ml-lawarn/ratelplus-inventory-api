// src/modules/vendors/vendors.module.ts

import { Module } from '@nestjs/common';

import { VendorsController } from './controllers/vendors.controller';

import { VendorsService } from './services/vendors.service';

import { VendorsRepository } from './repositories/vendors.repository';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],

  controllers: [VendorsController],

  providers: [VendorsService, VendorsRepository],

  exports: [VendorsService, VendorsRepository],
})
export class VendorsModule {}
