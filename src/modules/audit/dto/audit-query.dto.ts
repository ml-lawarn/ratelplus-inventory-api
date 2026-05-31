// src/modules/audit/dto/audit-query.dto.ts

import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class AuditQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Action filter',
    example: 'CREATE_ASSIGNMENT',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    description: 'Entity type filter',
    example: 'EquipmentAssignment',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'User ID that performed the action',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  performedById?: string;
}
