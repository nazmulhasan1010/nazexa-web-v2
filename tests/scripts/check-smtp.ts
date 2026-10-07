import { PrismaClient } from '@prisma/client';
import { decryptSecret } from '../../src/lib/config/encryption';

const prisma = new PrismaClient();

async function main() {
  const configs = await prisma.systemConfig.findMany({
    where: {
      OR: [
        { key: { startsWith: 'smtp' } },
        { key: { startsWith: 'email' } }
      ]
    }
  });

  for (const c of configs) {
    let decrypted = null;
    if (c.isSecret && c.valueEncrypted) {
      try {
        decrypted = decryptSecret(c.valueEncrypted);
      } catch (err: any) {
        decrypted = `DECRYPT_ERROR: ${err.message}`;
      }
    }
    console.log({
      key: c.key,
      category: c.category,
      valueType: c.valueType,
      valuePlain: c.valuePlain,
      isSecret: c.isSecret,
      decrypted,
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
