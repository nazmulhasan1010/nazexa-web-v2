const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.application.upsert({
    where: { clientId: 'nazexa-ai' },
    update: {
      clientSecret: 'secret-ai-platform-123',
      name: 'Nazexa AI Context Platform',
      status: 'active',
      redirectUris: 'http://localhost:2000/api/auth/sso,http://localhost:3001/api/auth/sso,http://localhost:3002/api/auth/sso',
      allowedOrigins: 'http://localhost:2000,http://localhost:3001,http://localhost:3002',
    },
    create: {
      clientId: 'nazexa-ai',
      clientSecret: 'secret-ai-platform-123',
      name: 'Nazexa AI Context Platform',
      status: 'active',
      redirectUris: 'http://localhost:2000/api/auth/sso,http://localhost:3001/api/auth/sso,http://localhost:3002/api/auth/sso',
      allowedOrigins: 'http://localhost:2000,http://localhost:3001,http://localhost:3002',
    },
  });

  // Also update legacy/typo record if present
  try {
    await prisma.application.update({
      where: { clientId: 'nazwxa-ai' },
      data: {
        clientSecret: 'secret-ai-platform-123',
        redirectUris: 'http://localhost:2000/api/auth/sso,http://localhost:3001/api/auth/sso,http://localhost:3002/api/auth/sso',
        allowedOrigins: 'http://localhost:2000,http://localhost:3001,http://localhost:3002',
      },
    });
  } catch {}

  console.log('Successfully registered nazexa-ai application in Central Auth');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
