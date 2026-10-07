import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const tpl = await prisma.systemEmailTemplate.findFirst({
    where: { contentHtml: { not: '' } }
  });
  if (tpl) {
    console.log(tpl.contentHtml.substring(0, 300));
  } else {
    console.log('No templates with HTML found');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
