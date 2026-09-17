'use server';

import { db } from '@/lib/db';

export async function getAppUrlsAction() {
  const urls: Record<string, string> = {
    'nazexa-db': 'http://localhost:8000',
    'nazexa-socket-platform': 'http://localhost:4000',
  };

  try {
    const apps = await db.application.findMany({
      select: { clientId: true, redirectUris: true },
    });

    for (const app of apps) {
      if (app.redirectUris) {
        const primary = app.redirectUris.split(',')[0].trim();
        if (primary) urls[app.clientId] = new URL(primary).origin;
      }
    }
  } catch (error) {
    // Ignore DB errors during build or start
  }

  return urls;
}
