import { db } from './src/lib/db'; db.mailMessage.deleteMany().then(() => { console.log('Cleared'); process.exit(0); });
