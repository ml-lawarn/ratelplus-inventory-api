// src/modules/assignments/dto/return-assignment.dto.ts

import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReturnAssignmentDto {
  @ApiPropertyOptional({
    description: 'Return remarks',
    example: 'Returned in good condition',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}
