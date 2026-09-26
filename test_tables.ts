import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient(); async function getTables() { const tables = await prisma.\\SHOW TABLES\; console.log(tables); } getTables();
