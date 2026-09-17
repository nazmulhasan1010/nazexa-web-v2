const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const app = await prisma.application.upsert({
    where: { clientId: 'nazexa-socket-platform' },
    update: {
      clientSecret: 'secret-socket-platform-123',
      name: 'Nazexa Socket Platform',
      status: 'active',
      redirectUris: 'http://localhost:4000/api/auth/sso',
      allowedOrigins: 'http://localhost:4000',
    },
    create: {
      clientId: 'nazexa-socket-platform',
      clientSecret: 'secret-socket-platform-123',
      name: 'Nazexa Socket Platform',
      status: 'active',
      redirectUris: 'http://localhost:4000/api/auth/sso',
      allowedOrigins: 'http://localhost:4000',
    },
  });
  console.log('App upserted successfully:', app);
}
main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
