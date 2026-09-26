import { ImapFlow } from 'imapflow';
import { db } from '@/lib/db';
import { buildImapClient, getImapConfigFromAccount } from './imap-client';
import { syncMailAccount } from './sync';

const MAX_RECONNECT_DELAY = 60000; // 1 minute
const INITIAL_RECONNECT_DELAY = 1000;

class ImapIdleManager {
  private clients: Map<string, { client: ImapFlow; reconnectDelay: number; active: boolean; reconnectTimer?: NodeJS.Timeout }> = new Map();
  private isShuttingDown = false;

  constructor() {
    this.startAllAccounts();
  }

  async startAllAccounts() {
    if (this.isShuttingDown) return;
    try {
      const accounts = await db.mailAccount.findMany({
        where: { status: 'active' },
      });
      for (const account of accounts) {
        if (!this.clients.has(account.id)) {
          this.connectAccount(account.id);
        }
      }
    } catch (error) {
      console.error('[IMAP IDLE] Failed to load accounts:', error);
    }
  }

  async connectAccount(accountId: string) {
    if (this.isShuttingDown) return;

    try {
      const account = await db.mailAccount.findUnique({ where: { id: accountId } });
      if (!account || account.status !== 'active') return;

      const config = getImapConfigFromAccount(account);
      const client = buildImapClient(config);

      this.clients.set(accountId, { client, reconnectDelay: INITIAL_RECONNECT_DELAY, active: true });

      client.on('error', (err) => {
        console.error(`[IMAP IDLE] [${account.email}] Error:`, err);
      });

      client.on('close', () => {
        console.log(`[IMAP IDLE] [${account.email}] Connection closed.`);
        this.scheduleReconnect(accountId);
      });

      // IMAP IDLE events
      client.on('exists', (data) => {
        console.log(`[IMAP IDLE] [${account.email}] New message exists, syncing...`);
        this.triggerSync(accountId);
      });
      
      client.on('flags', (data) => {
        console.log(`[IMAP IDLE] [${account.email}] Flags changed, syncing...`);
        this.triggerSync(accountId);
      });
      
      client.on('expunge', (data) => {
        console.log(`[IMAP IDLE] [${account.email}] Message expunged, syncing...`);
        this.triggerSync(accountId);
      });

      await client.connect();
      console.log(`[IMAP IDLE] [${account.email}] Connected.`);

      // Perform initial sync to catch up on any emails missed while the server was down
      console.log(`[IMAP IDLE] [${account.email}] Performing initial catch-up sync...`);
      await this.triggerSync(accountId);

      // Select INBOX and IDLE
      const lock = await client.getMailboxLock('INBOX');
      try {
        await client.idle();
        console.log(`[IMAP IDLE] [${account.email}] IDLE started.`);
        // Reset backoff on successful IDLE
        const state = this.clients.get(accountId);
        if (state) state.reconnectDelay = INITIAL_RECONNECT_DELAY;
      } finally {
        lock.release();
      }
    } catch (error) {
      console.error(`[IMAP IDLE] [Account ${accountId}] Failed to connect:`, error);
      this.scheduleReconnect(accountId);
    }
  }

  private scheduleReconnect(accountId: string) {
    if (this.isShuttingDown) return;
    const state = this.clients.get(accountId);
    if (!state) return;
    
    if (state.reconnectTimer) clearTimeout(state.reconnectTimer);
    
    const delay = state.reconnectDelay;
    console.log(`[IMAP IDLE] Scheduling reconnect for ${accountId} in ${delay}ms`);
    
    state.reconnectTimer = setTimeout(() => {
      this.connectAccount(accountId);
    }, delay);
    
    // Exponential backoff
    state.reconnectDelay = Math.min(delay * 2, MAX_RECONNECT_DELAY);
  }

  private syncTimers: Map<string, NodeJS.Timeout> = new Map();

  private triggerSync(accountId: string) {
    if (this.syncTimers.has(accountId)) {
      clearTimeout(this.syncTimers.get(accountId)!);
    }

    this.syncTimers.set(accountId, setTimeout(async () => {
      this.syncTimers.delete(accountId);
      try {
        const account = await db.mailAccount.findUnique({ where: { id: accountId } });
        if (account) {
          await syncMailAccount(account);
        }
      } catch (error) {
        console.error(`[IMAP IDLE] [Account ${accountId}] Sync failed:`, error);
      }
    }, 2000)); // Debounce by 2 seconds
  }

  public shutdown() {
    this.isShuttingDown = true;
    for (const [id, state] of this.clients.entries()) {
      if (state.reconnectTimer) clearTimeout(state.reconnectTimer);
      state.client.logout().catch(() => {});
    }
    this.clients.clear();
  }
}

// Global instance to prevent HMR leaks in dev mode
const globalForImap = globalThis as unknown as { __imapIdleManager: ImapIdleManager };

export function startMailRealtimeService() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (process.env.MAIL_REALTIME_ENABLED === 'false') {
      console.log('[IMAP IDLE] Realtime service disabled by env (MAIL_REALTIME_ENABLED=false)');
      return;
    }

    if (!globalForImap.__imapIdleManager) {
      console.log('[IMAP IDLE] Starting Realtime Manager...');
      globalForImap.__imapIdleManager = new ImapIdleManager();
    }
  }
}

export function shutdownMailRealtimeService() {
  if (globalForImap.__imapIdleManager) {
    globalForImap.__imapIdleManager.shutdown();
  }
}
