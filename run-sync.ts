import { db } from './src/lib/db';
import { syncAccount } from './src/lib/mail/sync';
(async () => {
  const account = await db.mailAccount.findFirst();
  if (!account) { console.log('No account found'); process.exit(0); }
  console.log('Syncing account:', account.email);
  const result = await syncAccount(account);
  console.log(result);
  process.exit(0);
})();
