import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();
async function main() {
  const templates = await prisma.systemEmailTemplate.findMany({ take: 1 });
  const html = templates[0].contentHtml;
  fs.writeFileSync('test-email.html', html);
}
main().finally(() => prisma.$disconnect());
