import { getSocketPlatformConfig } from './socket-config';

export async function publishAdminEvent(
  event: string,
  payload: any,
  room?: string,
  rooms?: string[]
) {
  let config: ReturnType<typeof getSocketPlatformConfig>;
  try {
    config = getSocketPlatformConfig();
  } catch (error) {
    console.error('[Socket Emitter] Socket is not configured; skipping emit', error);
    return;
  }

  try {
    const url = `${config.socketUrl}/internal/emit`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: config.projectId,
        secret: config.secretKey,
        event,
        data: payload,
        room: room || (!rooms ? 'admin:events' : undefined),
        rooms,
      }),
    });

    if (!res.ok) {
      console.warn(`[Socket Emitter] Failed to emit event ${event}: ${res.statusText}`);
    }
  } catch (error) {
    console.error(
      `[Socket Emitter] Could not connect to socket server at ${config.socketUrl}/internal/emit to emit ${event}:`,
      error
    );
  }
}
