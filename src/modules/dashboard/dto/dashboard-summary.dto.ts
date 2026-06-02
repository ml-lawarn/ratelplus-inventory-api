// src/modules/dashboard/dto/dashboard-summary.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryDto {
  @ApiProperty({ description: 'Total equipment items', example: 120 })
  totalEquipmentItems!: number;

  @ApiProperty({ description: 'Total warehouses', example: 4 })
  totalWarehouses!: number;

  @ApiProperty({ description: 'Total assignments', example: 80 })
  totalAssignments!: number;

  @ApiProperty({ description: 'Active assignments', example: 40 })
  activeAssignments!: number;

  @ApiProperty({ description: 'Overdue assignments', example: 3 })
  overdueAssignments!: number;

  @ApiProperty({ description: 'Items under maintenance', example: 6 })
  itemsUnderMaintenance!: number;

  @ApiProperty({ description: 'Low stock items', example: 8 })
  lowStockItems!: number;

  @ApiProperty({ description: 'Total inventory value', example: 15000000 })
  totalInventoryValue!: number;

  @ApiProperty({ description: 'Total maintenance cost', example: 500000 })
  totalMaintenanceCost!: number;
}
