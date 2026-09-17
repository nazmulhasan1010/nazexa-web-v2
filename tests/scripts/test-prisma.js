import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  const res = await prisma.contactMessage.deleteMany({ where: { id: 'test' } });
  console.log(res);
} catch (e) {
  console.error('Error:', e);
} finally {
  await prisma.$disconnect();
}
