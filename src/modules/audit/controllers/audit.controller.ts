// src/modules/audit/controllers/audit.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { AuditService } from '../services/audit.service';

import { AuditQueryDto } from '../dto/audit-query.dto';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';

import { RolesGuard } from '../../../core/guards/roles.guard';

import { Roles } from '../../../core/decorators/roles.decorator';

import { Role } from '../../../shared/enums/role.enum';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getAuditLogs(@Query() query: AuditQueryDto) {
    return this.auditService.getAuditLogs(query);
  }
}
