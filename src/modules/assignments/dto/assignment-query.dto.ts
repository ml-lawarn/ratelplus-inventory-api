// src/modules/assignments/dto/assignment-query.dto.ts

import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { AssignmentStatus } from '@prisma/client';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class AssignmentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  assignedToUserId?: string;

  @IsOptional()
  @IsUUID()
  equipmentItemId?: string;

  @IsOptional()
  @IsEnum(AssignmentStatus)
  assignmentStatus?: AssignmentStatus;
}
