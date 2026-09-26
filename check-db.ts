import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const configs = await prisma.systemConfig.findMany();
  console.log('Configs in DB:', configs.length);
  console.log(configs.map(c => c.key));
}
main().catch(console.error).finally(() => prisma.$disconnect());
