import { db } from './src/lib/db';
async function main() {
  const msgs = await db.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log(JSON.stringify(msgs, null, 2));
  process.exit(0);
}
main();
