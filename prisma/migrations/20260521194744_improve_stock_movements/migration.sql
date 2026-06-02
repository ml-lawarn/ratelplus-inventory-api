/*
  Warnings:

  - Added the required column `new_quantity` to the `stock_movements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previous_quantity` to the `stock_movements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "new_quantity" INTEGER NOT NULL,
ADD COLUMN     "previous_quantity" INTEGER NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 1;

-- CreateIndex
CREATE INDEX "stock_movements_movement_type_idx" ON "stock_movements"("movement_type");

-- CreateIndex
CREATE INDEX "stock_movements_movement_date_idx" ON "stock_movements"("movement_date");
