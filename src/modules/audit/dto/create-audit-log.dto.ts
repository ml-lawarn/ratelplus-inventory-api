// src/modules/audit/dto/create-audit-log.dto.ts

export class CreateAuditLogDto {
  action!: string;

  entityType!: string;

  entityId?: string;

  description?: string;

  ipAddress?: string;

  userAgent?: string;

  oldValues?: Record<string, any>;

  newValues?: Record<string, any>;

  performedById?: string;
}
