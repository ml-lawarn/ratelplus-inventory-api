/*
  Warnings:

  - A unique constraint covering the columns `[company_name]` on the table `vendors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "vendors_company_name_key" ON "vendors"("company_name");
