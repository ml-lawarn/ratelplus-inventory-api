-- CreateEnum
CREATE TYPE "MaintenancePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "maintenance_records" ADD COLUMN     "downtime_hours" DECIMAL(10,2),
ADD COLUMN     "labor_cost" DECIMAL(15,2),
ADD COLUMN     "parts_cost" DECIMAL(15,2),
ADD COLUMN     "priority" "MaintenancePriority" NOT NULL DEFAULT 'MEDIUM';

-- CreateIndex
CREATE INDEX "maintenance_records_maintenance_status_idx" ON "maintenance_records"("maintenance_status");

-- CreateIndex
CREATE INDEX "maintenance_records_priority_idx" ON "maintenance_records"("priority");
