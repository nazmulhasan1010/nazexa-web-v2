const { db } = require('./src/lib/db');
const { syncAccount } = require('./src/lib/mail/sync');
(async () => {
  const account = await db.mailAccount.findFirst();
  console.log('Syncing account:', account.email);
  const result = await syncAccount(account);
  console.log(result);
  process.exit(0);
})();
