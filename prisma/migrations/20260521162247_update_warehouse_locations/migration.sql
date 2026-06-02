/*
  Warnings:

  - A unique constraint covering the columns `[warehouse_id,location_code]` on the table `warehouse_locations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `warehouse_locations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "warehouse_locations" ADD COLUMN     "aisle" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "rack" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_locations_warehouse_id_location_code_key" ON "warehouse_locations"("warehouse_id", "location_code");
