// src/modules/audit/dto/create-audit-log.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiProperty({
    description: 'Audit action name',
    example: 'CREATE_ASSIGNMENT',
  })
  action!: string;

  @ApiProperty({
    description: 'Audited entity type',
    example: 'EquipmentAssignment',
  })
  entityType!: string;

  @ApiPropertyOptional({
    description: 'Audited entity ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Audit description',
    example: 'Equipment assigned to user',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Audit remarks',
    example: 'Assignment approved by supervisor',
  })
  remarks?: string;

  @ApiPropertyOptional({
    description: 'Request IP address',
    example: '127.0.0.1',
  })
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'Request user agent',
    example: 'Mozilla/5.0',
  })
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Previous entity values',
    example: { status: 'AVAILABLE' },
  })
  oldValues?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'New entity values',
    example: { status: 'DEPLOYED' },
  })
  newValues?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'User ID that performed the action',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  performedById?: string;
}
