// src/modules/inventory/controllers/inventory.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { InventoryService } from '../services/inventory.service';

import { CreateEquipmentItemDto } from '../dto/create-equipment-item.dto';
import { UpdateEquipmentItemDto } from '../dto/update-equipment-item.dto';
import { UpdateEquipmentStatusDto } from '../dto/update-equipment-status.dto';

import { InventoryQueryDto } from '../dto/inventory-query.dto';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';

import { RolesGuard } from '../../../core/guards/roles.guard';

import { Roles } from '../../../core/decorators/roles.decorator';

import { Role } from '../../../shared/enums/role.enum';
import { type JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create equipment item' })
  @ApiResponse({
    status: 201,
    description: 'Equipment item created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async createEquipmentItem(
    @Body() dto: CreateEquipmentItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.createEquipmentItem(dto, user.sub);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'List inventory items' })
  @ApiResponse({
    status: 200,
    description: 'Inventory items retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getInventoryItems(@Query() query: InventoryQueryDto) {
    return this.inventoryService.getInventoryItems(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'Get equipment item by ID' })
  @ApiResponse({
    status: 200,
    description: 'Equipment item retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getEquipmentItemById(@Param('id') id: string) {
    return this.inventoryService.getEquipmentItemById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update equipment item' })
  @ApiResponse({
    status: 200,
    description: 'Equipment item updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async updateEquipmentItem(
    @Param('id') id: string,
    @Body() dto: UpdateEquipmentItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.updateEquipmentItem(id, dto, user.sub);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update equipment status' })
  @ApiResponse({
    status: 200,
    description: 'Equipment status updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async updateEquipmentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEquipmentStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.updateEquipmentStatus(id, dto, user.sub);
  }
}
