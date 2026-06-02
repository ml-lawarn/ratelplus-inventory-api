// src/modules/users/dto/create-user.dto.ts

import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Role } from '../../../shared/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ description: 'Unique employee code', example: 'EMP-001' })
  @IsString()
  employeeCode: string;

  @ApiProperty({ description: 'User first name', example: 'Ada' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Lovelace' })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'ada@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+2348012345678',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ description: 'User role', enum: Role, example: Role.STAFF })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ description: 'User password', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'Department ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsString()
  departmentId?: string;
}
