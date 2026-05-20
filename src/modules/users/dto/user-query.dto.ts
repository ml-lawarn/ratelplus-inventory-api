// src/modules/users/dto/user-query.dto.ts

import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class UserQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
