import { db } from './src/lib/db';
import { getSocketPlatformConfig } from './src/lib/socket-config';

async function test() {
  const admin = await db.adminUser.findFirst();
  console.log('Admin:', admin?.email);

  const config = getSocketPlatformConfig();
  console.log('Config:', config);

  const res = await fetch(`${config.socketUrl}/api/servers/${config.projectId}/client-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-secret-key': config.secretKey,
    },
    body: JSON.stringify({
      secretKey: config.secretKey,
      userId: admin?.id,
      username: admin?.name || 'Admin',
      userEmail: admin?.email,
      ttlHours: 4,
    }),
  });

  const data = await res.json();
  console.log('Token data:', data);
}

test().catch(console.error);
