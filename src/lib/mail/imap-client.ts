/**
 * IMAP client using imapflow.
 * Connects to an IMAP server, lists folders, and fetches messages.
 */
import { ImapFlow } from 'imapflow';
import { decrypt } from './encryption';
import { sanitizeEmailHtml, extractPreview } from './sanitizer';
import type { MailAccount } from '@prisma/client';

export interface ImapConfig {
  host: string;
  port: number;
  security: string; // SSL/TLS | STARTTLS | NONE
  username: string;
  password: string;
}

export interface FetchedFolder {
  name: string;
  displayName: string;
  type: string;
}

export interface FetchedMessage {
  uid: number;
  messageId?: string;
  fromName?: string;
  fromEmail: string;
  toAddresses: string; // JSON
  ccAddresses?: string;
  subject: string;
  date: Date;
  bodyHtml?: string;
  bodyText?: string;
  preview?: string;
  hasAttachment: boolean;
  isRead: boolean;
  isStarred: boolean;
}

export function buildImapClient(config: ImapConfig): ImapFlow {
  const secure = config.security === 'SSL/TLS';
  return new ImapFlow({
    host: config.host,
    port: config.port,
    secure,
    auth: {
      user: config.username,
      pass: config.password,
    },
    logger: false,
    tls: {
      rejectUnauthorized: false, // Allow self-signed certs in dev
    },
  });
}

export function getImapConfigFromAccount(account: MailAccount): ImapConfig {
  return {
    host: account.imapHost,
    port: account.imapPort,
    security: account.imapSecurity,
    username: account.imapUsername,
    password: decrypt(account.imapPasswordEnc),
  };
}

/**
 * Test IMAP connection for an account. Returns { ok } or throws with message.
 */
export async function testImapConnection(account: MailAccount): Promise<{ ok: boolean }> {
  const config = getImapConfigFromAccount(account);
  const client = buildImapClient(config);
  await client.connect();
  await client.logout();
  return { ok: true };
}

/**
 * List folders available on the IMAP server.
 */
export async function listImapFolders(account: MailAccount): Promise<FetchedFolder[]> {
  const config = getImapConfigFromAccount(account);
  const client = buildImapClient(config);

  await client.connect();

  const folders: FetchedFolder[] = [];
  const list = await client.list();

  const typeMap: Record<string, string> = {
    '\\Inbox': 'inbox',
    '\\Sent': 'sent',
    '\\Drafts': 'drafts',
    '\\Trash': 'trash',
    '\\Junk': 'spam',
    '\\Spam': 'spam',
    '\\Archive': 'archive',
    '\\Flagged': 'starred',
    '\\All': 'all',
  };

  for (const folder of list) {
    const specialUse = (folder as any).specialUse as string | undefined;
    const type = specialUse ? (typeMap[specialUse] || 'custom') : 'custom';

    const nameLower = folder.name.toLowerCase();
    let inferredType = type;
    if (inferredType === 'custom') {
      if (nameLower === 'inbox') inferredType = 'inbox';
      else if (nameLower.includes('sent')) inferredType = 'sent';
      else if (nameLower.includes('draft')) inferredType = 'drafts';
      else if (nameLower.includes('trash') || nameLower.includes('deleted')) inferredType = 'trash';
      else if (nameLower.includes('junk') || nameLower.includes('spam')) inferredType = 'spam';
      else if (nameLower.includes('archive')) inferredType = 'archive';
    }

    folders.push({
      name: folder.name,
      displayName: folder.name.split('/').pop() || folder.name,
      type: inferredType,
    });
  }

  await client.logout();
  return folders;
}

/**
 * Fetch messages from a specific IMAP folder since a given UID (for incremental sync).
 */
export async function fetchMessages(
  account: MailAccount,
  folderName: string,
  sinceUid: number = 0,
  limit: number = 50
): Promise<FetchedMessage[]> {
  const config = getImapConfigFromAccount(account);
  const client = buildImapClient(config);

  await client.connect();

  const lock = await client.getMailboxLock(folderName);
  const messages: FetchedMessage[] = [];

  try {
    const mailbox = client.mailbox;
    if (!mailbox || mailbox.exists === 0) return [];

    // If we have a sinceUid, we fetch newer messages by UID.
    // If not, it's the first sync, so we fetch the last `limit` messages by sequence number.
    let sequence = '';
    let fetchOptions = {};
    if (sinceUid > 0) {
      sequence = `${sinceUid + 1}:*`;
      fetchOptions = { uid: true };
    } else {
      const startSeq = Math.max(1, mailbox.exists - limit + 1);
      sequence = `${startSeq}:*`;
      fetchOptions = {}; // fetch by sequence number
    }

    for await (const msg of client.fetch(sequence, {
      uid: true,
      flags: true,
      envelope: true,
      bodyStructure: true,
      source: false,
    }, fetchOptions)) {
      const envelope = msg.envelope;
      if (!envelope) continue;

      const fromAddr = envelope.from?.[0];
      const fromEmail = fromAddr?.address || '';
      const fromName = fromAddr?.name || undefined;

      const toList = (envelope.to || []).map((a: any) => ({ name: a.name, email: a.address }));
      const ccList = (envelope.cc || []).map((a: any) => ({ name: a.name, email: a.address }));

      const isRead = msg.flags.has('\\Seen');
      const isStarred = msg.flags.has('\\Flagged');

      // Detect attachments from body structure
      const hasAttachment = detectAttachments(msg.bodyStructure);

      messages.push({
        uid: msg.uid,
        messageId: envelope.messageId,
        fromName,
        fromEmail,
        toAddresses: JSON.stringify(toList),
        ccAddresses: ccList.length > 0 ? JSON.stringify(ccList) : undefined,
        subject: envelope.subject || '(no subject)',
        date: envelope.date || new Date(),
        hasAttachment,
        isRead,
        isStarred,
      });
    }
  } finally {
    lock.release();
  }

  await client.logout();
  return messages.slice(0, limit);
}

/**
 * Fetch a single full message (with body) by UID.
 */
export async function fetchFullMessage(
  account: MailAccount,
  folderName: string,
  uid: number
): Promise<{ bodyHtml: string; bodyText: string; preview: string; attachments: AttachmentPart[] }> {
  const config = getImapConfigFromAccount(account);
  const client = buildImapClient(config);

  await client.connect();

  const lock = await client.getMailboxLock(folderName);
  let result = { bodyHtml: '', bodyText: '', preview: '', attachments: [] as AttachmentPart[] };

  try {
    for await (const msg of client.fetch(`${uid}`, {
      uid: true,
      source: true,
      bodyStructure: true,
    }, { uid: true })) {
      const parsed = await parseRawMessage(msg.source);
      result = parsed;
    }

    // Mark as read
    await client.messageFlagsAdd(`${uid}`, ['\\Seen'], { uid: true });
  } finally {
    lock.release();
  }

  await client.logout();
  return result;
}

/**
 * Append a raw RFC822 message to a specific folder (like Sent).
 */
export async function appendMessageToFolder(
  account: MailAccount,
  folderName: string,
  rawMessage: string | Buffer
): Promise<void> {
  const config = getImapConfigFromAccount(account);
  const client = buildImapClient(config);

  await client.connect();
  try {
    await client.append(folderName, rawMessage, ['\\Seen']);
  } catch (err) {
    console.error(`Failed to append message to ${folderName}:`, err);
  } finally {
    await client.logout();
  }
}

interface AttachmentPart {
  fileName: string;
  mimeType: string;
  content: Buffer;
  cid?: string;
}

async function parseRawMessage(source: Buffer | undefined): Promise<{
  bodyHtml: string;
  bodyText: string;
  preview: string;
  attachments: AttachmentPart[];
}> {
  if (!source) return { bodyHtml: '', bodyText: '', preview: '', attachments: [] };

  // Use Node's built-in stream parsing
  const { simpleParser } = await import('mailparser').catch(() => ({ simpleParser: null }));
  if (!simpleParser) {
    // Fallback: return raw text
    return {
      bodyHtml: '',
      bodyText: source.toString('utf8').slice(0, 5000),
      preview: source.toString('utf8').slice(0, 200),
      attachments: [],
    };
  }

  const parsed = await simpleParser(source);

  const rawHtml = parsed.html || '';
  const rawText = parsed.text || '';
  const bodyHtml = rawHtml ? sanitizeEmailHtml(rawHtml) : '';
  const bodyText = rawText;
  const preview = extractPreview(rawText, rawHtml);

  const attachments: AttachmentPart[] = (parsed.attachments || []).map((a) => ({
    fileName: a.filename || 'attachment',
    mimeType: a.contentType || 'application/octet-stream',
    content: a.content,
    cid: a.cid,
  }));

  return { bodyHtml, bodyText, preview, attachments };
}

function detectAttachments(bodyStructure: any): boolean {
  if (!bodyStructure) return false;

  const check = (node: any): boolean => {
    if (!node) return false;
    if (node.disposition?.toLowerCase() === 'attachment') return true;
    if (node.childNodes) {
      return node.childNodes.some(check);
    }
    return false;
  };

  return check(bodyStructure);
}
