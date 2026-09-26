export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startMailRealtimeService } = await import('./lib/mail/imap-idle-manager');
    startMailRealtimeService();
  }
}
