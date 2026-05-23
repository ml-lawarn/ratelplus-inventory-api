// src/modules/dashboard/dto/dashboard-summary.dto.ts

export class DashboardSummaryDto {
  totalEquipmentItems!: number;

  totalWarehouses!: number;

  totalAssignments!: number;

  activeAssignments!: number;

  overdueAssignments!: number;

  itemsUnderMaintenance!: number;

  lowStockItems!: number;

  totalInventoryValue!: number;

  totalMaintenanceCost!: number;
}
