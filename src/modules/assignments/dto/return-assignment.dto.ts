// src/modules/assignments/dto/return-assignment.dto.ts

import { IsOptional, IsString } from 'class-validator';

export class ReturnAssignmentDto {
  @IsOptional()
  @IsString()
  remarks?: string;
}
