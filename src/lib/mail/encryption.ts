/**
 * AES-256-GCM encryption/decryption for storing mail credentials at rest.
 * Requires MAIL_ENCRYPTION_KEY env var — 32 bytes hex-encoded (64 hex chars).
 *
 * Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const keyHex = process.env.MAIL_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error(
      'MAIL_ENCRYPTION_KEY is missing or invalid. Set a 64-char hex string (32 bytes) in your .env.'
    );
  }
  return Buffer.from(keyHex, 'hex');
}

/**
 * Encrypt a plaintext string.
 * Returns a base64 string in format: iv:ciphertext:tag
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    iv.toString('base64'),
    encrypted.toString('base64'),
    tag.toString('base64'),
  ].join(':');
}

/**
 * Decrypt a string produced by encrypt().
 */
export function decrypt(ciphertext: string): string {
  const key = getKey();
  const [ivB64, encB64, tagB64] = ciphertext.split(':');

  if (!ivB64 || !encB64 || !tagB64) {
    throw new Error('Invalid encrypted credential format');
  }

  const iv = Buffer.from(ivB64, 'base64');
  const encrypted = Buffer.from(encB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encrypted) + decipher.final('utf8');
}

/**
 * Check if encryption is configured (key present).
 */
export function isEncryptionConfigured(): boolean {
  const keyHex = process.env.MAIL_ENCRYPTION_KEY;
  return !!(keyHex && keyHex.length === 64);
}
