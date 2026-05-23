// src/modules/inventory/dto/inventory-query.dto.ts

import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { EquipmentCondition, EquipmentStatus } from '@prisma/client';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class InventoryQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus;

  @IsOptional()
  @IsEnum(EquipmentCondition)
  condition?: EquipmentCondition;
}
