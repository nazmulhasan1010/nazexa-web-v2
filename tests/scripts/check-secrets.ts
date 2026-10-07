import { PrismaClient } from '@prisma/client';
import { decryptSecret } from '../../src/lib/config/encryption.ts';

const prisma = new PrismaClient();

async function main() {
  const configs = await prisma.systemConfig.findMany({
    where: { key: { startsWith: 'oauth.' } }
  });
  
  for (const config of configs) {
    if (config.isSecret && config.valueEncrypted) {
      console.log(config.key, '->', decryptSecret(config.valueEncrypted));
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
