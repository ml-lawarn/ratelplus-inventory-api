// src/modules/categories/dto/create-category.dto.ts

import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Laptops' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Portable computers',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Parent category ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsString()
  parentCategoryId?: string;
}
