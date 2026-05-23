// src/modules/audit/dto/audit-query.dto.ts

import { IsOptional, IsString, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class AuditQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsUUID()
  performedById?: string;
}
