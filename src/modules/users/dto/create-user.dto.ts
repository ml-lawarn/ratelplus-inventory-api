// src/modules/users/dto/create-user.dto.ts

import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { Role } from '../../../shared/enums/role.enum';

export class CreateUserDto {
  @IsString()
  employeeCode: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsEnum(Role)
  role: Role;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  departmentId?: string;
}
