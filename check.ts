import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const templates = await prisma.systemEmailTemplate.findMany();
  for(const t of templates) {
      const html = t.contentHtml || '';
      console.log(t.name + ' HAS EMAIL-COL: ' + html.includes('email-col'));
  }
}
main().finally(() => prisma.$disconnect());
