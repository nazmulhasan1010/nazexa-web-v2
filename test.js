const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); async function run() { const tables = await prisma.\('SHOW TABLES'); console.log(tables); } run();
