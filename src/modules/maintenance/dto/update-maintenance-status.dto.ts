// src/modules/maintenance/dto/update-maintenance-status.dto.ts

import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MaintenanceStatus } from '@prisma/client';

export class UpdateMaintenanceStatusDto {
  @ApiProperty({
    description: 'New maintenance status',
    enum: MaintenanceStatus,
    example: MaintenanceStatus.IN_PROGRESS,
  })
  @IsEnum(MaintenanceStatus)
  maintenanceStatus!: MaintenanceStatus;

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

  @ApiPropertyOptional({
    description: 'Resolution notes',
    example: 'Issue resolved',
  })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
