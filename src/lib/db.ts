import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

console.log('=== PRISMA INIT ===');
console.log('CWD:', process.cwd());

export const db = globalThis.prisma || new PrismaClient();

// test query immediately to see if it works and log error
if (!globalThis.prisma) {
  db.homeSection
    .count()
    .then((c) => console.log('DB COUNT SUCCESS:', c))
    .catch((e) => {
      console.error('=== DB INIT ERROR ===');
      console.error(e);
    });
}

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;
