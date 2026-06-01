// src/modules/warehouse-locations/dto/warehouse-location-query.dto.ts

import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class WarehouseLocationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by location code, room, or shelf',
    example: 'A1',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Warehouse ID filter',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;
}
