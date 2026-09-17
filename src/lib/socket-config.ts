export function getSocketPlatformConfig(): {
  socketUrl: string;
  projectId: string;
  secretKey: string;
} {
  const socketUrl =
    process.env.SOCKET_SERVER_URL || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
  const projectId = process.env.NEXT_PUBLIC_SOCKET_PROJECT_ID;
  const secretKey = process.env.SOCKET_SECRET_KEY || process.env.INTERNAL_SOCKET_SECRET;

  if (!projectId || !secretKey) {
    throw new Error('NEXT_PUBLIC_SOCKET_PROJECT_ID and SOCKET_SECRET_KEY must be configured');
  }

  return { socketUrl, projectId, secretKey };
}
