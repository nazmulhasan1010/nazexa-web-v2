import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

try {
  await prisma.$connect();
  console.log('Connected successfully!');
  await prisma.$disconnect();
} catch (e) {
  console.error('Error:', e);
}
