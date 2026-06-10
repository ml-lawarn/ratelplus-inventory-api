// src/modules/assignments/dto/create-assignment.dto.ts

import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({
    description: 'Equipment item ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsString()
  @IsUUID()
  equipmentItemId!: string;

  @ApiProperty({
    description: 'User ID receiving the equipment',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsUUID()
  assignedToUserId!: string;

  @ApiPropertyOptional({
    description: 'User ID assigning the equipment',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  assignedByUserId?: string;

  @ApiPropertyOptional({
    description: 'Expected return date',
    example: '2026-06-30T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expectedReturnDate?: string;

  @ApiPropertyOptional({
    description: 'Assignment remarks',
    example: 'Issued for field work',
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({
    description: 'Quantity assigned',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  assignedQuantity?: number;

  @ApiPropertyOptional({
    description: 'Source location ID (where equipment is being deployed from)',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsUUID()
  sourceLocationId?: string;
}
