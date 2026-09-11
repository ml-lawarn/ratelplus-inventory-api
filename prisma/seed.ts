// prisma/seed.ts
import 'dotenv/config'; // Load environment variables from .env file

import { randomBytes } from 'crypto';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { Role } from '../src/shared/enums/role.enum';

import * as bcrypt from 'bcrypt';

// 🔑 1. Create the native PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

// 🔑 3. Instantiate PrismaClient using exclusively the adapter option
const prisma = new PrismaClient({ adapter });

function generateRandomPassword(): string {
  // 24 random bytes -> 32-char base64url string, well above any minimum
  // length/complexity requirement and safe to print once as a one-time secret.
  return randomBytes(24).toString('base64url');
}

async function main() {
  console.log('🌱 Seeding database...');

  const email = process.env.SEED_ADMIN_EMAIL;

  if (!email) {
    throw new Error(
      'SEED_ADMIN_EMAIL is required to seed the initial SUPER_ADMIN account. ' +
        'Set it in your environment before running the seed script.',
    );
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email } });

  if (existingAdmin) {
    console.log(
      `ℹ️  Admin account ${email} already exists — skipping seed (no password change).`,
    );
    return;
  }

  // Never hardcode a default password: either the operator supplies one via
  // SEED_ADMIN_PASSWORD, or we generate a strong random one and print it
  // ONCE so it can be captured and stored securely. This account must have
  // its password rotated immediately if it was ever seeded with a
  // predictable value in the past.
  const plainPassword =
    process.env.SEED_ADMIN_PASSWORD || generateRandomPassword();
  const generated = !process.env.SEED_ADMIN_PASSWORD;

  const password = await bcrypt.hash(plainPassword, 10);

  await prisma.user.create({
    data: {
      employeeCode: 'EMP-002',
      firstName: 'System',
      lastName: 'Administrator',
      email,
      password,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log(`✅ SUPER_ADMIN account created: ${email}`);

  if (generated) {
    console.log(
      '\n⚠️  A random password was generated because SEED_ADMIN_PASSWORD was not set.\n' +
        `   Password (shown once, will not be recoverable): ${plainPassword}\n` +
        '   Store it in a password manager now and change it after first login.\n',
    );
  }
}

main()
  .catch((e) => {
    console.error(e);

    process.exit(1);
  })

  .finally(async () => {
    await prisma.$disconnect();
  });
