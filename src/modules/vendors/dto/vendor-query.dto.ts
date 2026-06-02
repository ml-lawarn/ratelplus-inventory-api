// src/modules/vendors/dto/vendor-query.dto.ts

import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class VendorQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by company, contact, or email',
    example: 'Acme',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
