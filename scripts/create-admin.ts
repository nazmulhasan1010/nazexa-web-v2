import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@nazexa.com';
  const password = 'password123'; // Standard secure test password

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user ${email} already exists.`);
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(12);
  const password_hash = await bcrypt.hash(password, salt);

  await prisma.adminUser.create({
    data: {
      email,
      name: 'Super Admin',
      password_hash,
      role: 'super_admin',
      status: 'active',
    },
  });

  console.log(`Successfully created admin user:`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
