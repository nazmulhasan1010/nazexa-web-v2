import { db } from './src/lib/db';
async function main() {
  console.log(await db.aiProviderConfig.findUnique({ where: { id: 'global' } }));
  await db.aiProviderConfig.update({
    where: { id: 'global' },
    data: { googleApiKey: 'test-key-via-script' },
  });
  console.log('updated');
}
main();
