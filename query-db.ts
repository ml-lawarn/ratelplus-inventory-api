import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  console.log("Users:", users.map(u => ({ email: u.email, role: u.role })))
  
  const warehouses = await prisma.warehouse.findMany()
  console.log("Warehouses:", warehouses.map(w => ({ id: w.id, name: w.name })))
}

main().catch(console.error).finally(() => prisma.$disconnect())
