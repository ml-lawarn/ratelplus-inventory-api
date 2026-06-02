// src/modules/categories/dto/category-query.dto.ts

import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class CategoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by category name',
    example: 'Laptop',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
