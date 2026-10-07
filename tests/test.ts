import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient(); prisma.homeSection.count().then(console.log);
