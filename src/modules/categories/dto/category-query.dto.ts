// src/modules/categories/dto/category-query.dto.ts

import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class CategoryQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
