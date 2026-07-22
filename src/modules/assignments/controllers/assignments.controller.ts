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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AssignmentsService } from '../services/assignments.service';

import { CreateAssignmentDto } from '../dto/create-assignment.dto';

import { AssignmentQueryDto } from '../dto/assignment-query.dto';

import { ReturnAssignmentDto } from '../dto/return-assignment.dto';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';

import { RolesGuard } from '../../../core/guards/roles.guard';

import { Roles } from '../../../core/decorators/roles.decorator';

import { Role } from '../../../shared/enums/role.enum';

import { CurrentUser } from '../../../core/decorators/current-user.decorator';

import type { JwtPayload } from '../../../shared/interfaces/jwt-payload.interface';

@ApiTags('Assignments')
@ApiBearerAuth()
@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create assignment' })
  @ApiResponse({ status: 201, description: 'Equipment assigned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async createAssignment(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.assignmentsService.createAssignment(dto, user.sub);
  }

  @Patch(':id/return')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Return assignment' })
  @ApiResponse({ status: 200, description: 'Equipment returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async returnAssignment(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReturnAssignmentDto,
  ) {
    return this.assignmentsService.returnAssignment(id, dto, user.sub);
  }

  @Get()
  @Roles(
    Role.ADMIN,
    Role.SUPER_ADMIN,
    Role.MANAGER,
    Role.STAFF,
    Role.TRAINEE,
    Role.INTERN,
  )
  @ApiOperation({ summary: 'List assignments' })
  @ApiResponse({
    status: 200,
    description: 'Assignments retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getAssignments(@Query() query: AssignmentQueryDto) {
    return this.assignmentsService.getAssignments(query);
  }

  @Get(':id')
  @Roles(
    Role.ADMIN,
    Role.SUPER_ADMIN,
    Role.MANAGER,
    Role.STAFF,
    Role.TRAINEE,
    Role.INTERN,
  )
  @ApiOperation({ summary: 'Get assignment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Assignment retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getAssignmentById(@Param('id') id: string) {
    return this.assignmentsService.getAssignmentById(id);
  }
}
