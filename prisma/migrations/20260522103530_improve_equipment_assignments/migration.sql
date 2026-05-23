/*
  Warnings:

  - Added the required column `updated_at` to the `equipment_assignments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "equipment_assignments" ADD COLUMN     "assigned_quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "equipment_assignments_assignment_status_idx" ON "equipment_assignments"("assignment_status");
