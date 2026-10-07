import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.application.upsert({
    where: { clientId: 'nazexa-socket-platform' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      clientId: 'nazexa-socket-platform',
      clientSecret: 'secret-socket-platform-123', // dummy secret
      name: 'Nazexa Socket Platform',
      status: 'active',
      redirectUris: 'http://localhost:4000/api/auth/sso',
      allowedOrigins: 'http://localhost:4000'
    }
  });
  
  const apps = await prisma.application.findMany();
  console.log(JSON.stringify(apps, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
