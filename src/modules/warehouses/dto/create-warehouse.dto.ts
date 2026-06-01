// src/modules/warehouses/dto/create-warehouse.dto.ts

import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseDto {
  @ApiProperty({ description: 'Warehouse name', example: 'Main Warehouse' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Unique warehouse code', example: 'WH-LAG-001' })
  @IsString()
  code!: string;

  @ApiPropertyOptional({
    description: 'Warehouse address',
    example: '1 Marina Road',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Warehouse city', example: 'Lagos' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Warehouse state', example: 'Lagos' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Warehouse country', example: 'Nigeria' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Warehouse latitude',
    example: '6.5243793',
  })
  @IsOptional()
  @IsLatitude()
  latitude?: string;

  @ApiPropertyOptional({
    description: 'Warehouse longitude',
    example: '3.3792057',
  })
  @IsOptional()
  @IsLongitude()
  longitude?: string;

  @ApiPropertyOptional({
    description: 'Whether the warehouse is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Warehouse manager user ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  managerId?: string;
}
