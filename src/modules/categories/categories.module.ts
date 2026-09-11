// src/modules/categories/categories.module.ts

import { Module } from '@nestjs/common';

import { CategoriesController } from './controllers/categories.controller';

import { CategoriesService } from './services/categories.service';

import { CategoriesRepository } from './repositories/categories.repository';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],

  controllers: [CategoriesController],

  providers: [CategoriesService, CategoriesRepository],

  exports: [CategoriesService, CategoriesRepository],
})
export class CategoriesModule {}
