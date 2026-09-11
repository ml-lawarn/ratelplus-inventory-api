import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current account password',
    example: 'oldPassword123',
  })
  @IsString()
  @MinLength(6)
  oldPassword!: string;

  @ApiProperty({
    description:
      'New password (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 symbol)',
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
  newPassword!: string;
}
