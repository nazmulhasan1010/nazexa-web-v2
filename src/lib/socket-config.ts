import { ConfigService } from './config/service';

export async function getSocketPlatformConfig(): Promise<{
  socketUrl: string;
  projectId: string;
  secretKey: string;
}> {
  const socketUrl = await ConfigService.getConfig<string>('socket.url', process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000');
  const projectId = await ConfigService.getConfig<string>('socket.projectId', process.env.NEXT_PUBLIC_SOCKET_PROJECT_ID);
  const secretKey = await ConfigService.getSecretConfig('socket.secretKey') || process.env.SOCKET_SECRET_KEY || process.env.INTERNAL_SOCKET_SECRET;

  if (!projectId || !secretKey) {
    throw new Error('NEXT_PUBLIC_SOCKET_PROJECT_ID and SOCKET_SECRET_KEY must be configured');
  }

  return { socketUrl, projectId, secretKey };
}
