// src/modules/departments/dto/department-query.dto.ts

import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class DepartmentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by department name',
    example: 'IT',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
