// src/modules/users/dto/create-user.dto.ts

import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
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

  @ApiProperty({
    description:
      'User password (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 symbol)',
    example: 'Str0ng!Pass',
  })
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @ApiPropertyOptional({
    description: 'Department ID',
    example: '7e641827-2f96-4d3c-96bc-a35cfac40733',
  })
  @IsOptional()
  @IsString()
  departmentId?: string;
}
