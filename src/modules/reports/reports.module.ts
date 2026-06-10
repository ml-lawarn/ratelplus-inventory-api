// src/modules/reports/reports.module.ts

import { Module } from '@nestjs/common';

import { ReportsController } from './controllers/reports.controller';

import { ReportsService } from './services/reports.service';

import { PdfModule } from '../../infrastructure/pdf/pdf.module';

@Module({
  imports: [PdfModule],
  controllers: [ReportsController],

  providers: [ReportsService],
})
export class ReportsModule {}
