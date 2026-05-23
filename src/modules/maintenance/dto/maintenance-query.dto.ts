// src/modules/maintenance/dto/maintenance-query.dto.ts

import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { MaintenancePriority, MaintenanceStatus } from '@prisma/client';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class MaintenanceQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  equipmentItemId?: string;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  maintenanceStatus?: MaintenanceStatus;

  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;
}
