import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.systemConfig.deleteMany({
    where: {
      key: {
        startsWith: 'oauth.'
      }
    }
  });
  console.log('Deleted corrupted client secrets. Falling back to .env!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
