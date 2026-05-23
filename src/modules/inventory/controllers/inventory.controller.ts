// src/modules/inventory/controllers/inventory.controller.ts

import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { InventoryService } from '../services/inventory.service';

import { CreateEquipmentItemDto } from '../dto/create-equipment-item.dto';

import { InventoryQueryDto } from '../dto/inventory-query.dto';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';

import { RolesGuard } from '../../../core/guards/roles.guard';

import { Roles } from '../../../core/decorators/roles.decorator';

import { Role } from '../../../shared/enums/role.enum';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async createEquipmentItem(@Body() dto: CreateEquipmentItemDto) {
    return this.inventoryService.createEquipmentItem(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.STAFF)
  async getInventoryItems(@Query() query: InventoryQueryDto) {
    return this.inventoryService.getInventoryItems(query);
  }
}
