import { ApiProperty } from '@nestjs/swagger';
import { EquipmentStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateEquipmentStatusDto {
  @ApiProperty({
    description: 'New equipment status',
    enum: EquipmentStatus,
    example: EquipmentStatus.AVAILABLE,
  })
  @IsEnum(EquipmentStatus)
  status!: EquipmentStatus;
}
