const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.aiproviderconfig.upsert({
    where: { id: 'global' },
    update: { activeProvider: 'openai' },
    create: { id: 'global', activeProvider: 'openai' }
  });

  await prisma.aiagent.create({
    data: {
      name: 'Test Agent',
      model: 'gpt-4o-mini',
      apiKey: 'sk-test',
      isActive: true,
    }
  });
  console.log('Done');
}
main();
