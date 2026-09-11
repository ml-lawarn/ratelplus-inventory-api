// src/modules/brands/brands.module.ts

import { Module } from '@nestjs/common';

import { BrandsController } from './controllers/brands.controller';

import { BrandsService } from './services/brands.service';

import { BrandsRepository } from './repositories/brands.repository';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],

  controllers: [BrandsController],

  providers: [BrandsService, BrandsRepository],

  exports: [BrandsService, BrandsRepository],
})
export class BrandsModule {}
