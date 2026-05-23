// src/modules/maintenance/dto/create-maintenance-record.dto.ts

import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

import { MaintenancePriority, MaintenanceStatus } from '@prisma/client';

export class CreateMaintenanceRecordDto {
  @IsString()
  maintenanceType!: string;

  @IsOptional()
  @IsString()
  issueDescription?: string;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  maintenanceStatus?: MaintenanceStatus;

  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsDateString()
  maintenanceStartDate?: string;

  @IsOptional()
  @IsDateString()
  maintenanceEndDate?: string;

  @IsOptional()
  @IsDecimal()
  downtimeHours?: string;

  @IsOptional()
  @IsString()
  technicianName?: string;

  @IsOptional()
  @IsPhoneNumber('NG')
  technicianPhone?: string;

  @IsOptional()
  @IsDecimal()
  repairCost?: string;

  @IsOptional()
  @IsDecimal()
  partsCost?: string;

  @IsOptional()
  @IsDecimal()
  laborCost?: string;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @IsOptional()
  @IsDateString()
  nextMaintenanceDate?: string;

  @IsString()
  @IsUUID()
  equipmentItemId!: string;

  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @IsString()
  //   @IsUUID()
  createdById!: string;
}
