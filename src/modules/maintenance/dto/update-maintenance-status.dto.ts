// src/modules/maintenance/dto/update-maintenance-status.dto.ts

import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

import { MaintenanceStatus } from '@prisma/client';

export class UpdateMaintenanceStatusDto {
  @IsEnum(MaintenanceStatus)
  maintenanceStatus!: MaintenanceStatus;

  @IsOptional()
  @IsDateString()
  maintenanceStartDate?: string;

  @IsOptional()
  @IsDateString()
  maintenanceEndDate?: string;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
