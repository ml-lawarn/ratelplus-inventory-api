/*
  Warnings:

  - The `specifications` column on the `equipment_items` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EquipmentCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED');

-- AlterTable
ALTER TABLE "equipment_items" ADD COLUMN     "condition" "EquipmentCondition" NOT NULL DEFAULT 'GOOD',
ADD COLUMN     "current_value" DECIMAL(15,2),
ADD COLUMN     "minimum_stock_level" INTEGER,
ADD COLUMN     "reorder_level" INTEGER,
DROP COLUMN "specifications",
ADD COLUMN     "specifications" JSONB;

-- CreateIndex
CREATE INDEX "equipment_items_warehouse_id_idx" ON "equipment_items"("warehouse_id");

-- CreateIndex
CREATE INDEX "equipment_items_condition_idx" ON "equipment_items"("condition");
