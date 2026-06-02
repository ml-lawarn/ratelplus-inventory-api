// src/modules/maintenance/dto/maintenance-query.dto.ts

import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { MaintenancePriority, MaintenanceStatus } from '@prisma/client';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class MaintenanceQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Equipment item ID filter',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  equipmentItemId?: string;

  @ApiPropertyOptional({
    description: 'Maintenance status filter',
    enum: MaintenanceStatus,
    example: MaintenanceStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  maintenanceStatus?: MaintenanceStatus;

  @ApiPropertyOptional({
    description: 'Priority filter',
    enum: MaintenancePriority,
    example: MaintenancePriority.HIGH,
  })
  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @ApiPropertyOptional({
    description:
      'Search term to filter by equipment name, category, or maintenance notes',
    example: 'laptop',
  })
  @IsOptional()
  search?: string;
}
