import { PrismaClient } from '@prisma/client';
import { compileEmailHtmlV2 } from './src/lib/email/compiler-v2';

const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.systemEmailTemplate.findMany();
  for (const t of templates) {
    if (t.designJson) {
      try {
        const design = JSON.parse(t.designJson);
        if (design.version === 2 || design.theme || design.blocks) {
            // It's a design we can compile. The builder uses migrateV1toV2 for old ones, 
            // but we can just require them to save manually if it's too old. 
            // Assuming it's already v2 since I recently updated it.
            if(design.version === 2) {
                const newHtml = compileEmailHtmlV2(design);
                await prisma.systemEmailTemplate.update({
                  where: { id: t.id },
                  data: { contentHtml: newHtml }
                });
                console.log('Updated ' + t.name);
            }
        }
      } catch (e) {
        console.error('Failed to parse ' + t.name, e);
      }
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
