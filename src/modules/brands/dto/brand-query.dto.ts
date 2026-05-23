// src/modules/brands/dto/brand-query.dto.ts

import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class BrandQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
