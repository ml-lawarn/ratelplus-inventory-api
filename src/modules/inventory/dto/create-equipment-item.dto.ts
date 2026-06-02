// src/modules/inventory/dto/create-equipment-item.dto.ts

import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsJSON,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EquipmentCondition, EquipmentStatus } from '@prisma/client';

export class CreateEquipmentItemDto {
  @ApiProperty({ description: 'Unique asset tag', example: 'AST-0001' })
  @IsString()
  assetTag!: string;

  @ApiPropertyOptional({ description: 'Serial number', example: 'SN123456789' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiProperty({ description: 'Equipment name', example: 'Dell Latitude 7440' })
  @IsString()
  equipmentName!: string;

  @ApiPropertyOptional({
    description: 'Model number',
    example: 'Latitude 7440',
  })
  @IsOptional()
  @IsString()
  modelNumber?: string;

  @ApiPropertyOptional({
    description: 'Equipment description',
    example: '14-inch business laptop',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'JSON specifications string',
    example: '{"ram":"16GB","storage":"512GB SSD"}',
  })
  @IsOptional()
  @IsJSON()
  specifications?: string;

  @ApiPropertyOptional({
    description: 'Purchase date',
    example: '2026-05-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ description: 'Purchase cost', example: 1500000 })
  @IsOptional()
  @IsNumber()
  purchaseCost?: number;

  @ApiPropertyOptional({ description: 'Current value', example: 1200000 })
  @IsOptional()
  @IsNumber()
  currentValue?: number;

  @ApiPropertyOptional({
    description: 'Warranty start date',
    example: '2026-05-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  warrantyStartDate?: string;

  @ApiPropertyOptional({
    description: 'Warranty end date',
    example: '2027-05-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  warrantyEndDate?: string;

  @ApiPropertyOptional({
    description: 'Equipment status',
    enum: EquipmentStatus,
    example: EquipmentStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus;

  @ApiPropertyOptional({
    description: 'Equipment condition',
    enum: EquipmentCondition,
    example: EquipmentCondition.GOOD,
  })
  @IsOptional()
  @IsEnum(EquipmentCondition)
  condition?: EquipmentCondition;

  @ApiPropertyOptional({
    description: 'Whether item is serialized',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isSerialized?: boolean;

  @ApiPropertyOptional({
    description: 'Available quantity',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Minimum stock level', example: 5 })
  @IsOptional()
  @IsInt()
  minimumStockLevel?: number;

  @ApiPropertyOptional({ description: 'Reorder level', example: 10 })
  @IsOptional()
  @IsInt()
  reorderLevel?: number;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Brand ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional({
    description: 'Vendor ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiPropertyOptional({
    description: 'Warehouse ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({
    description: 'Warehouse location ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  warehouseLocationId?: string;
}
