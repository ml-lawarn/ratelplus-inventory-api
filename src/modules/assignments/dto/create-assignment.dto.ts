// src/modules/assignments/dto/create-assignment.dto.ts

import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsUUID()
  equipmentItemId!: string;

  @IsString()
  // @IsUUID()
  assignedToUserId!: string;

  @IsString()
  // @IsUUID()
  assignedByUserId!: string;

  @IsOptional()
  @IsDateString()
  expectedReturnDate?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  assignedQuantity?: number;
}
