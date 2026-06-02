// src/modules/assignments/dto/assignment-query.dto.ts

import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { AssignmentStatus } from '@prisma/client';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class AssignmentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Assigned-to user ID filter',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  assignedToUserId?: string;

  @ApiPropertyOptional({
    description: 'Equipment item ID filter',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  equipmentItemId?: string;

  @ApiPropertyOptional({
    description: 'Assignment status filter',
    enum: AssignmentStatus,
    example: AssignmentStatus.ASSIGNED,
  })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  assignmentStatus?: AssignmentStatus;

  @ApiPropertyOptional({
    description:
      'Search term to filter by equipment name, category, or assigned user name',
    example: 'laptop',
  })
  @IsOptional()
  search?: string;
}
