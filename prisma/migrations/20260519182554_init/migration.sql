-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('AVAILABLE', 'DEPLOYED', 'MAINTENANCE', 'RETIRED', 'LOST', 'DAMAGED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ASSIGNED', 'RETURNED', 'OVERDUE', 'LOST');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('STOCK_IN', 'STOCK_OUT', 'TRANSFER', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "employee_code" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "role" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "department_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_category_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "contact_person" TEXT,
    "email" TEXT,
    "phone_number" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'Nigeria',
    "website" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'Nigeria',
    "manager_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_locations" (
    "id" TEXT NOT NULL,
    "location_code" TEXT NOT NULL,
    "room" TEXT,
    "shelf" TEXT,
    "bin" TEXT,
    "description" TEXT,
    "warehouse_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_items" (
    "id" TEXT NOT NULL,
    "asset_tag" TEXT NOT NULL,
    "serial_number" TEXT,
    "equipment_name" TEXT NOT NULL,
    "model_number" TEXT,
    "description" TEXT,
    "specifications" TEXT,
    "purchase_date" TIMESTAMP(3),
    "purchase_cost" DECIMAL(15,2),
    "warranty_start_date" TIMESTAMP(3),
    "warranty_end_date" TIMESTAMP(3),
    "status" "EquipmentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "is_serialized" BOOLEAN NOT NULL DEFAULT true,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "category_id" TEXT,
    "brand_id" TEXT,
    "vendor_id" TEXT,
    "warehouse_location_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "movement_type" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reference_number" TEXT,
    "remarks" TEXT,
    "equipment_item_id" TEXT NOT NULL,
    "source_location_id" TEXT,
    "destination_location_id" TEXT,
    "performed_by_id" TEXT NOT NULL,
    "movement_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_assignments" (
    "id" TEXT NOT NULL,
    "assignment_status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "checkout_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_return_date" TIMESTAMP(3),
    "actual_return_date" TIMESTAMP(3),
    "remarks" TEXT,
    "equipment_item_id" TEXT NOT NULL,
    "assigned_to_user_id" TEXT NOT NULL,
    "assigned_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" TEXT NOT NULL,
    "maintenance_type" TEXT NOT NULL,
    "issue_description" TEXT,
    "maintenance_status" "MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_date" TIMESTAMP(3),
    "maintenance_start_date" TIMESTAMP(3),
    "maintenance_end_date" TIMESTAMP(3),
    "technician_name" TEXT,
    "technician_phone" TEXT,
    "repair_cost" DECIMAL(15,2),
    "resolution_notes" TEXT,
    "next_maintenance_date" TIMESTAMP(3),
    "equipment_item_id" TEXT NOT NULL,
    "vendor_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_code_key" ON "users"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_department_id_idx" ON "users"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "categories_parent_category_id_idx" ON "categories"("parent_category_id");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE INDEX "warehouses_manager_id_idx" ON "warehouses"("manager_id");

-- CreateIndex
CREATE INDEX "warehouse_locations_warehouse_id_idx" ON "warehouse_locations"("warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_items_asset_tag_key" ON "equipment_items"("asset_tag");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_items_serial_number_key" ON "equipment_items"("serial_number");

-- CreateIndex
CREATE INDEX "equipment_items_category_id_idx" ON "equipment_items"("category_id");

-- CreateIndex
CREATE INDEX "equipment_items_brand_id_idx" ON "equipment_items"("brand_id");

-- CreateIndex
CREATE INDEX "equipment_items_vendor_id_idx" ON "equipment_items"("vendor_id");

-- CreateIndex
CREATE INDEX "equipment_items_warehouse_location_id_idx" ON "equipment_items"("warehouse_location_id");

-- CreateIndex
CREATE INDEX "equipment_items_status_idx" ON "equipment_items"("status");

-- CreateIndex
CREATE INDEX "stock_movements_equipment_item_id_idx" ON "stock_movements"("equipment_item_id");

-- CreateIndex
CREATE INDEX "stock_movements_performed_by_id_idx" ON "stock_movements"("performed_by_id");

-- CreateIndex
CREATE INDEX "equipment_assignments_equipment_item_id_idx" ON "equipment_assignments"("equipment_item_id");

-- CreateIndex
CREATE INDEX "equipment_assignments_assigned_to_user_id_idx" ON "equipment_assignments"("assigned_to_user_id");

-- CreateIndex
CREATE INDEX "maintenance_records_equipment_item_id_idx" ON "maintenance_records"("equipment_item_id");

-- CreateIndex
CREATE INDEX "maintenance_records_vendor_id_idx" ON "maintenance_records"("vendor_id");

-- CreateIndex
CREATE INDEX "maintenance_records_created_by_id_idx" ON "maintenance_records"("created_by_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_locations" ADD CONSTRAINT "warehouse_locations_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_items" ADD CONSTRAINT "equipment_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_items" ADD CONSTRAINT "equipment_items_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_items" ADD CONSTRAINT "equipment_items_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_items" ADD CONSTRAINT "equipment_items_warehouse_location_id_fkey" FOREIGN KEY ("warehouse_location_id") REFERENCES "warehouse_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_equipment_item_id_fkey" FOREIGN KEY ("equipment_item_id") REFERENCES "equipment_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_source_location_id_fkey" FOREIGN KEY ("source_location_id") REFERENCES "warehouse_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_destination_location_id_fkey" FOREIGN KEY ("destination_location_id") REFERENCES "warehouse_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_assignments" ADD CONSTRAINT "equipment_assignments_equipment_item_id_fkey" FOREIGN KEY ("equipment_item_id") REFERENCES "equipment_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_assignments" ADD CONSTRAINT "equipment_assignments_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_assignments" ADD CONSTRAINT "equipment_assignments_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_equipment_item_id_fkey" FOREIGN KEY ("equipment_item_id") REFERENCES "equipment_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
