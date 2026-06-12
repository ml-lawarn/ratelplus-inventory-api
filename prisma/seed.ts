// prisma/seed.ts
import 'dotenv/config'; // Load environment variables from .env file

import { PrismaClient } from '@prisma/client';

import { Role } from '../src/shared/enums/role.enum';

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
}

main()
  .catch((e) => {
    console.error(e);

    process.exit(1);
  })

  .finally(async () => {
    await prisma.$disconnect();
  });
