// prisma/seed.ts

import {
  PrismaClient,
  EquipmentStatus,
  AssignmentStatus,
  MaintenanceStatus,
} from '@prisma/client';

import { Role } from 'src/shared/enums/role.enum';

import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const password = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@ratelplus.net',
    },

    update: {},

    create: {
      employeeCode: 'EMP-002',
      firstName: 'System',

      lastName: 'Administrator',

      email: 'admin@ratelplus.net',

      password,

      role: Role.SUPER_ADMIN,
    },
  });

  const warehouse = await prisma.warehouse.create({
    data: {
      name: 'Main Warehouse',

      code: 'WH-LAG-001',

      city: 'Lagos',

      state: 'Lagos',

      country: 'Nigeria',

      managerId: admin.id,
    },
  });

  const category = await prisma.category.create({
    data: {
      name: 'Networking Equipment',
    },
  });

  const vendor = await prisma.vendor.create({
    data: {
      companyName: 'Cisco Nigeria Ltd',

      email: 'support@cisco.ng',

      phoneNumber: '+2348012345678',
    },
  });

  const equipment = await prisma.equipmentItem.create({
    data: {
      assetTag: 'RATEL-ROUTER-001',

      serialNumber: 'SN-ABC-12345',

      equipmentName: 'Cisco Router',

      modelNumber: 'RV340',

      quantity: 5,

      minimumStockLevel: 2,

      status: EquipmentStatus.AVAILABLE,

      isSerialized: false,

      purchaseCost: 450000,

      categoryId: category.id,

      vendorId: vendor.id,

      warehouseId: warehouse.id,
    },
  });

  await prisma.equipmentAssignment.create({
    data: {
      equipmentItemId: equipment.id,

      assignedToUserId: admin.id,

      assignedByUserId: admin.id,

      assignmentStatus: AssignmentStatus.ASSIGNED,

      assignedQuantity: 1,
    },
  });

  await prisma.maintenanceRecord.create({
    data: {
      maintenanceType: 'Routine Maintenance',

      maintenanceStatus: MaintenanceStatus.SCHEDULED,

      equipmentItemId: equipment.id,

      createdById: admin.id,
    },
  });

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);

    process.exit(1);
  })

  .finally(async () => {
    await prisma.$disconnect();
  });
