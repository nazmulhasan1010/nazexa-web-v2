const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const apps = await prisma.application.findMany();
  console.log(apps);
}
main().finally(() => prisma.$disconnect());
