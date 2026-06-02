// src/modules/warehouse-locations/dto/create-warehouse-location.dto.ts

import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseLocationDto {
  @ApiProperty({
    description: 'Location code unique within warehouse',
    example: 'A1-R2-S3',
  })
  @IsString()
  locationCode!: string;

  @ApiPropertyOptional({
    description: 'Room name or number',
    example: 'Server Room',
  })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiPropertyOptional({ description: 'Aisle identifier', example: 'A1' })
  @IsOptional()
  @IsString()
  aisle?: string;

  @ApiPropertyOptional({ description: 'Rack identifier', example: 'R2' })
  @IsOptional()
  @IsString()
  rack?: string;

  @ApiPropertyOptional({ description: 'Shelf identifier', example: 'S3' })
  @IsOptional()
  @IsString()
  shelf?: string;

  @ApiPropertyOptional({ description: 'Bin identifier', example: 'B4' })
  @IsOptional()
  @IsString()
  bin?: string;

  @ApiPropertyOptional({
    description: 'Location description',
    example: 'Top shelf for laptops',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the location is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Warehouse ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsUUID()
  warehouseId!: string;
}
