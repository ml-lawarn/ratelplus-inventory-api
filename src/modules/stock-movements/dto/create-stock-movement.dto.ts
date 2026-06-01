// src/modules/stock-movements/dto/create-stock-movement.dto.ts

import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { StockMovementType } from '@prisma/client';

export class CreateStockMovementDto {
  @ApiProperty({
    description: 'Stock movement type',
    enum: StockMovementType,
    example: StockMovementType.STOCK_IN,
  })
  @IsEnum(StockMovementType)
  movementType!: StockMovementType;

  @ApiProperty({ description: 'Movement quantity', example: 5, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({
    description: 'Equipment item ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsUUID()
  equipmentItemId!: string;

  @ApiPropertyOptional({
    description: 'Source location ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  sourceLocationId?: string;

  @ApiPropertyOptional({
    description: 'Destination location ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  destinationLocationId?: string;

  @ApiPropertyOptional({
    description: 'User ID performing movement',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  performedById?: string;

  @ApiPropertyOptional({
    description: 'Reference number',
    example: 'GRN-2026-001',
  })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional({
    description: 'Movement remarks',
    example: 'Initial stock receipt',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}
