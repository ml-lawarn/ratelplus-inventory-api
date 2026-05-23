// src/modules/departments/dto/department-query.dto.ts

import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class DepartmentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
