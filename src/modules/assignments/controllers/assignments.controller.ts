// src/modules/assignments/controllers/assignments.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AssignmentsService } from '../services/assignments.service';

import { CreateAssignmentDto } from '../dto/create-assignment.dto';

import { AssignmentQueryDto } from '../dto/assignment-query.dto';

import { ReturnAssignmentDto } from '../dto/return-assignment.dto';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';

import { RolesGuard } from '../../../core/guards/roles.guard';

import { Roles } from '../../../core/decorators/roles.decorator';

import { Role } from '../../../shared/enums/role.enum';

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  async createAssignment(@Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.createAssignment(dto);
  }

  @Patch(':id/return')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  async returnAssignment(
    @Param('id') id: string,

    @Body() dto: ReturnAssignmentDto,
  ) {
    return this.assignmentsService.returnAssignment(id, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.STAFF)
  async getAssignments(@Query() query: AssignmentQueryDto) {
    return this.assignmentsService.getAssignments(query);
  }
}
