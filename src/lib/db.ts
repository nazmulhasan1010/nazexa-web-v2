import { PrismaClient } from '@prisma/client';
import * as nextEnv from '@next/env';

declare global {
  var prisma: PrismaClient | undefined;
}

// Next.js standalone mode worker threads might not have the correct environment variables.
// We load them explicitly using Next's native env loader to ensure both main and worker threads have them.
const projectDir = process.cwd();
const loadEnvConfig = nextEnv.loadEnvConfig || (nextEnv as any).default?.loadEnvConfig;
if (loadEnvConfig) {
  loadEnvConfig(projectDir);
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
