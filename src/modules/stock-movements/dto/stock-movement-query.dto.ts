// src/modules/stock-movements/dto/stock-movement-query.dto.ts

import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { StockMovementType } from '@prisma/client';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class StockMovementQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Equipment item ID filter',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  equipmentItemId?: string;

  @ApiPropertyOptional({
    description: 'Movement type filter',
    enum: StockMovementType,
    example: StockMovementType.TRANSFER,
  })
  @IsOptional()
  @IsEnum(StockMovementType)
  movementType?: StockMovementType;

  @ApiPropertyOptional({
    description: 'Search term for filtering by equipment name or SKU',
    example: 'laptop',
  })
  @IsOptional()
  search?: string;
}
