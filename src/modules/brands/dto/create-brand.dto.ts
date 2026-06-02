// src/modules/brands/dto/create-brand.dto.ts

import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ description: 'Brand name', example: 'Dell' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: 'Brand description',
    example: 'Enterprise hardware brand',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
