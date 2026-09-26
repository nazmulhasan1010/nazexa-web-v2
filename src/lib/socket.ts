import { getSocketPlatformConfig } from './socket-config';

export async function publishAdminEvent(
  event: string,
  payload: any,
  room?: string,
  rooms?: string[]
) {
  let config: Awaited<ReturnType<typeof getSocketPlatformConfig>>;
  try {
    config = await getSocketPlatformConfig();
  } catch (error) {
    console.error('[Socket Emitter] Socket is not configured; skipping emit', error);
    return;
  }

  try {
    const url = `${config.socketUrl}/internal/emit`;
    
    const targetRooms = rooms || [room || 'admin:events'];
    
    await Promise.all(targetRooms.map(r => 
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: config.projectId,
          secret: config.secretKey,
          event,
          data: payload,
          room: r,
        }),
      })
    ));
  } catch (error) {
    console.error(
      `[Socket Emitter] Could not connect to socket server at ${config.socketUrl}/internal/emit to emit ${event}:`,
      error
    );
  }
}
