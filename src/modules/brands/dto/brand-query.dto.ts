// src/modules/brands/dto/brand-query.dto.ts

import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class BrandQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by brand name', example: 'Dell' })
  @IsOptional()
  @IsString()
  search?: string;
}
