import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.systemConfig.findFirst({ where: { key: 'oauth.google.clientId' } });
  console.log(c);
}
main().catch(console.error).finally(() => prisma.$disconnect());
