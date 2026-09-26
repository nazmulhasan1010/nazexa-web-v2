const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const tables = await prisma.$queryRawUnsafe('SHOW TABLES');
  console.log(tables);
}
run().finally(() => prisma.$disconnect());
