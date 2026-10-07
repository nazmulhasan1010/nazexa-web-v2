import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient(); async function getTables() { const tables = await prisma.$queryRaw`SHOW TABLES`; console.log(tables); } getTables();
