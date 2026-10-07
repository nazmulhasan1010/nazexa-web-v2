const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.application.upsert({
    where: { clientId: 'nazexa-socket-platform' },
    update: {},
    create: {
      clientId: 'nazexa-socket-platform',
      clientSecret: 'secret-socket-platform-123',
      name: 'Nazexa Socket Platform',
      status: 'active',
      redirectUris: 'http://localhost:4000/api/auth/sso',
      allowedOrigins: 'http://localhost:4000',
      paymentWebhookUrl: 'http://localhost:4000/api/webhooks/payments',
    },
  });
  console.log('Created socket platform app in Central Auth');
}
main().finally(() => prisma.$disconnect());
