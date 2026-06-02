// src/modules/departments/dto/create-department.dto.ts

import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department name', example: 'IT' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Department description',
    example: 'Information technology team',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
