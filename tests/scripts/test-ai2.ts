import { db } from './src/lib/db';
async function main() {
  await db.aiProviderConfig.update({
    where: { id: 'global' },
    data: { googleApiKey: 'YOUR_API_KEY' },
  });
  console.log('restored');
}
main();
