// src/modules/warehouses/controllers/warehouses.controller.ts

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

import { WarehousesService } from '../services/warehouses.service';

import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';
import { WarehouseQueryDto } from '../dto/warehouse-query.dto';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';

import { Roles } from '../../../core/decorators/roles.decorator';

import { Role } from '../../../shared/enums/role.enum';

@ApiTags('Warehouses')
@ApiBearerAuth()
@Controller('warehouses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create warehouse' })
  @ApiResponse({ status: 201, description: 'Warehouse created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async createWarehouse(@Body() dto: CreateWarehouseDto) {
    return this.warehousesService.createWarehouse(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'List warehouses' })
  @ApiResponse({
    status: 200,
    description: 'Warehouses retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getWarehouses(@Query() query: WarehouseQueryDto) {
    return this.warehousesService.getWarehouses(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'Get warehouse by ID' })
  @ApiResponse({ status: 200, description: 'Warehouse retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getWarehouseById(@Param('id') id: string) {
    return this.warehousesService.getWarehouseById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async updateWarehouse(
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.updateWarehouse(id, dto);
  }

  @Patch(':id/activate')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Activate warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse activated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async activateWarehouse(@Param('id') id: string) {
    return this.warehousesService.setActiveState(id, true);
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deactivate warehouse' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse deactivated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async deactivateWarehouse(@Param('id') id: string) {
    return this.warehousesService.setActiveState(id, false);
  }
}
