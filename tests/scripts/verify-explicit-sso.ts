import { NextRequest } from 'next/server';
import { middleware as webMiddleware } from '../../src/middleware';

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 VERIFYING EXPLICIT-ONLY SSO CHECK IN NAZEXA-WEB');
  console.log('===============================================================\n');

  const fakeCentralSession = 'mock-central-session-token-12345';

  // 1: Direct navigation to /login with central session
  const webDirectReq = new NextRequest('http://localhost:3000/login', {
    headers: {
      cookie: `nazexa_session=${fakeCentralSession}`,
    },
  });
  const webDirectRes = webMiddleware(webDirectReq);
  const webDirectLocation = webDirectRes.headers.get('location');
  console.log('Direct request to http://localhost:3000/login with session:');
  console.log('Redirect Location:', webDirectLocation ?? '(None - allows access to page)');

  if (webDirectLocation && webDirectLocation.includes('/profile')) {
    throw new Error('FAILED: nazexa-web still auto-redirects /login to /profile!');
  }
  console.log('✅ [PASS] nazexa-web allows viewing /login without bouncing away\n');

  // 2: External redirect request to /login with central session (from clicking SSO in satellite)
  const webSsoReq = new NextRequest(
    'http://localhost:3000/login?redirect=http%3A%2F%2Flocalhost%3A8000%2Fapi%2Fauth%2Fsso%3Fredirect%3D%2Fdashboard',
    {
      headers: {
        cookie: `nazexa_session=${fakeCentralSession}`,
      },
    }
  );
  const webSsoRes = webMiddleware(webSsoReq);
  const webSsoLocation = webSsoRes.headers.get('location') || '';
  console.log('External SSO request to http://localhost:3000/login with session:');
  console.log('Redirect Location:', webSsoLocation);

  if (!webSsoLocation.includes('handoff=mock-central-session-token-12345')) {
    throw new Error(`FAILED: Expected redirect with handoff token, but got: ${webSsoLocation}`);
  }
  console.log('✅ [PASS] nazexa-web forwards handoff to satellite app when session already exists\n');

  console.log('===============================================================');
  console.log('🎉 NAZEXA-WEB MIDDLEWARE CHECKS PASSED SUCCESSFULLY!');
  console.log('===============================================================');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
