import { testEmailConnectionAction } from '../../src/app/admin/configuration/actions';
import { db } from '../../src/lib/db';

// We mock getAdminSession or run directly if session check works
// Since testEmailConnectionAction calls getAdminSession() which expects a cookie/request header,
// let's test how it behaves or mock getAdminSession for testing.

async function run() {
  console.log('Testing testEmailConnectionAction validation...');
  try {
    const res = await testEmailConnectionAction({
      host: '',
    });
    console.log('Result without session:', res);
  } catch (err: any) {
    console.log('Correctly threw or rejected unauthorized without admin session:', err.message);
  }
}

run()
  .catch(console.error)
  .finally(() => db.$disconnect());
