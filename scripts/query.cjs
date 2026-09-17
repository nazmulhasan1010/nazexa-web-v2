const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.paymentGateway
  .findFirst({ where: { code: 'custom_payment' } })
  .then((r) => console.log(r))
  .finally(() => prisma.$disconnect());
