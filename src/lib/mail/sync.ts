/**
 * Mail sync orchestrator.
 * Connects to IMAP, syncs folders and messages into the DB.
 * Designed to be called from an API route (manual sync or polling).
 */
import { db } from '@/lib/db';
import { listImapFolders, fetchMessages } from './imap-client';
import { publishAdminEvent } from '@/lib/socket';
import type { MailAccount } from '@prisma/client';

export interface SyncResult {
  accountId: string;
  foldersUpserted: number;
  messagesAdded: number;
  errors: string[];
}

/**
 * Sync a single mail account.
 */
export async function syncMailAccount(account: MailAccount): Promise<SyncResult> {
  const result: SyncResult = {
    accountId: account.id,
    foldersUpserted: 0,
    messagesAdded: 0,
    errors: [],
  };

  try {
    // 1. Sync folders
    const remoteFolders = await listImapFolders(account);

    for (const rf of remoteFolders) {
      await db.mailFolder.upsert({
        where: { accountId_name: { accountId: account.id, name: rf.name } },
        create: {
          accountId: account.id,
          name: rf.name,
          displayName: rf.displayName,
          type: rf.type,
        },
        update: {
          displayName: rf.displayName,
          type: rf.type,
        },
      });
      result.foldersUpserted++;
    }

    // 2. Sync messages for key folders
    const syncFolders = await db.mailFolder.findMany({
      where: {
        accountId: account.id,
        type: { in: ['inbox', 'sent', 'trash', 'spam', 'archive'] },
      },
    });

    let newMessageCount = 0;

    for (const folder of syncFolders) {
      try {
        // Find highest UID we already have for this folder
        const latest = await db.mailMessage.findFirst({
          where: { accountId: account.id, folderId: folder.id },
          orderBy: { uid: 'desc' },
          select: { uid: true },
        });
        const sinceUid = latest?.uid ?? 0;

        const messages = await fetchMessages(account, folder.name, sinceUid, 50);

        for (const msg of messages) {
          try {
            const existing = await db.mailMessage.findUnique({
              where: { accountId_folderId_uid: { accountId: account.id, folderId: folder.id, uid: msg.uid } },
            });
            if (existing) continue;

            await db.mailMessage.create({
              data: {
                accountId: account.id,
                folderId: folder.id,
                uid: msg.uid,
                messageId: msg.messageId,
                fromName: msg.fromName,
                fromEmail: msg.fromEmail,
                toAddresses: msg.toAddresses,
                ccAddresses: msg.ccAddresses,
                subject: msg.subject,
                date: msg.date,
                preview: msg.preview,
                hasAttachment: msg.hasAttachment,
                isRead: msg.isRead,
                isStarred: msg.isStarred,
                folderType: folder.type,
              },
            });
            newMessageCount++;
          } catch (msgErr: any) {
            result.errors.push(`[${folder.name}] uid ${msg.uid}: ${msgErr.message}`);
          }
        }

        // Update folder unread/total counts
        const unread = await db.mailMessage.count({ where: { accountId: account.id, folderId: folder.id, isRead: false } });
        const total = await db.mailMessage.count({ where: { accountId: account.id, folderId: folder.id } });
        await db.mailFolder.update({ where: { id: folder.id }, data: { unreadCount: unread, totalCount: total } });

      } catch (folderErr: any) {
        result.errors.push(`[${folder.name}] sync error: ${folderErr.message}`);
      }
    }

    result.messagesAdded = newMessageCount;

    // 3. Update account sync metadata
    await db.mailAccount.update({
      where: { id: account.id },
      data: {
        status: 'active',
        lastSyncAt: new Date(),
        lastSyncCount: newMessageCount,
        lastSyncError: result.errors.length > 0 ? result.errors.join('; ').slice(0, 500) : null,
      },
    });

    // 4. Broadcast new mail event if any new messages arrived
    if (newMessageCount > 0) {
      await publishAdminEvent('mail.new', {
        accountId: account.id,
        email: account.email,
        count: newMessageCount,
      }, 'admin:events');
    }

  } catch (err: any) {
    const errorMsg = err?.message || 'Unknown sync error';
    result.errors.push(`Account sync failed: ${errorMsg}`);

    await db.mailAccount.update({
      where: { id: account.id },
      data: {
        status: 'error',
        lastSyncError: errorMsg.slice(0, 500),
      },
    }).catch(() => {});
  }

  return result;
}

/**
 * Sync all active mail accounts.
 */
export async function syncAllMailAccounts(): Promise<SyncResult[]> {
  const accounts = await db.mailAccount.findMany({
    where: { status: { not: 'disconnected' } },
  });

  const results: SyncResult[] = [];
  for (const account of accounts) {
    const r = await syncMailAccount(account);
    results.push(r);
  }
  return results;
}
