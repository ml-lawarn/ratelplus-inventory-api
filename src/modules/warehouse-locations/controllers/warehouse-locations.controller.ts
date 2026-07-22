// src/modules/warehouse-locations/controllers/warehouse-locations.controller.ts

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

import { WarehouseLocationsService } from '../services/warehouse-locations.service';

import { CreateWarehouseLocationDto } from '../dto/create-warehouse-location.dto';
import { UpdateWarehouseLocationDto } from '../dto/update-warehouse-location.dto';

import { WarehouseLocationQueryDto } from '../dto/warehouse-location-query.dto';

import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';

import { RolesGuard } from '../../../core/guards/roles.guard';

import { Roles } from '../../../core/decorators/roles.decorator';

import { Role } from '../../../shared/enums/role.enum';

@ApiTags('Warehouse Locations')
@ApiBearerAuth()
@Controller('warehouse-locations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehouseLocationsController {
  constructor(
    private readonly warehouseLocationsService: WarehouseLocationsService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create warehouse location' })
  @ApiResponse({
    status: 201,
    description: 'Warehouse location created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async createWarehouseLocation(@Body() dto: CreateWarehouseLocationDto) {
    return this.warehouseLocationsService.createWarehouseLocation(dto);
  }

  @Get()
  @Roles(
    Role.ADMIN,
    Role.SUPER_ADMIN,
    Role.MANAGER,
    Role.STAFF,
    Role.TRAINEE,
    Role.INTERN,
  )
  @ApiOperation({ summary: 'List warehouse locations' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse locations retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getWarehouseLocations(@Query() query: WarehouseLocationQueryDto) {
    return this.warehouseLocationsService.getWarehouseLocations(query);
  }

  @Get(':id')
  @Roles(
    Role.ADMIN,
    Role.SUPER_ADMIN,
    Role.MANAGER,
    Role.STAFF,
    Role.TRAINEE,
    Role.INTERN,
  )
  @ApiOperation({ summary: 'Get warehouse location by ID' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse location retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async getWarehouseLocationById(@Param('id') id: string) {
    return this.warehouseLocationsService.getWarehouseLocationById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update warehouse location' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse location updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async updateWarehouseLocation(
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseLocationDto,
  ) {
    return this.warehouseLocationsService.updateWarehouseLocation(id, dto);
  }
}
