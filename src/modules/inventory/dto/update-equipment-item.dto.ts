import { PartialType } from '@nestjs/swagger';

import { CreateEquipmentItemDto } from './create-equipment-item.dto';

export class UpdateEquipmentItemDto extends PartialType(
  CreateEquipmentItemDto,
) {}
