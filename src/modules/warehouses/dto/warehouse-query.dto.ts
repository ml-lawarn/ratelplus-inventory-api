// src/modules/warehouses/dto/warehouse-query.dto.ts

import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class WarehouseQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by name, code, or city',
    example: 'Lagos',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
