import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current account password',
    example: 'oldPassword123',
  })
  @IsString()
  @MinLength(6)
  oldPassword!: string;

  @ApiProperty({
    description: 'New account password',
    example: 'newPassword123',
  })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
