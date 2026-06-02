// src/modules/maintenance/dto/create-maintenance-record.dto.ts

import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MaintenancePriority, MaintenanceStatus } from '@prisma/client';

export class CreateMaintenanceRecordDto {
  @ApiProperty({ description: 'Maintenance type', example: 'Repair' })
  @IsString()
  maintenanceType!: string;

  @ApiPropertyOptional({
    description: 'Issue description',
    example: 'Screen flickering intermittently',
  })
  @IsOptional()
  @IsString()
  issueDescription?: string;

  @ApiPropertyOptional({
    description: 'Maintenance status',
    enum: MaintenanceStatus,
    example: MaintenanceStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  maintenanceStatus?: MaintenanceStatus;

  @ApiPropertyOptional({
    description: 'Maintenance priority',
    enum: MaintenancePriority,
    example: MaintenancePriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @ApiPropertyOptional({
    description: 'Scheduled date',
    example: '2026-06-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({
    description: 'Maintenance start date',
    example: '2026-06-01T09:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  maintenanceStartDate?: string;

  @ApiPropertyOptional({
    description: 'Maintenance end date',
    example: '2026-06-01T12:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  maintenanceEndDate?: string;

  @ApiPropertyOptional({ description: 'Downtime hours', example: '3.00' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  downtimeHours?: string;

  @ApiPropertyOptional({
    description: 'Technician name',
    example: 'John Technician',
  })
  @IsOptional()
  @IsString()
  technicianName?: string;

  @ApiPropertyOptional({
    description: 'Technician phone number',
    example: '+2348012345678',
  })
  @IsOptional()
  @IsPhoneNumber('NG')
  technicianPhone?: string;

  @ApiPropertyOptional({ description: 'Repair cost', example: '50000.00' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  repairCost?: string;

  @ApiPropertyOptional({ description: 'Parts cost', example: '30000.00' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  partsCost?: string;

  @ApiPropertyOptional({ description: 'Labor cost', example: '20000.00' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  laborCost?: string;

  @ApiPropertyOptional({
    description: 'Resolution notes',
    example: 'Display cable replaced',
  })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @ApiPropertyOptional({
    description: 'Next maintenance date',
    example: '2026-12-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  nextMaintenanceDate?: string;

  @ApiProperty({
    description: 'Equipment item ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsString()
  @IsUUID()
  equipmentItemId!: string;

  @ApiPropertyOptional({
    description: 'Vendor ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiPropertyOptional({
    description: 'Creator user ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  createdById?: string;
}
