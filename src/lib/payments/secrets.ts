/**
 * Encrypt/decrypt gateway secret fields at rest (AES-256-GCM).
 * Non-secret config stays plaintext in the JSON blob for admin UX.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { GatewayConfigField } from '@/lib/payments/types';

const PREFIX = 'enc:v1:';

function getMasterKey(): Buffer | null {
  const raw = process.env.PAYMENT_ENCRYPTION_KEY;
  if (!raw || raw.length < 16) return null;
  return createHash('sha256').update(raw).digest();
}

export function encryptSecret(plaintext: string): string {
  const key = getMasterKey();
  if (!key) return plaintext; // Dev fallback — set PAYMENT_ENCRYPTION_KEY in production.
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptSecret(value: string): string {
  if (!value.startsWith(PREFIX)) return value;
  const key = getMasterKey();
  if (!key) throw new Error('PAYMENT_ENCRYPTION_KEY required to decrypt credentials');
  const [, packed] = value.split(PREFIX);
  const [ivB64, tagB64, dataB64] = packed.split('.');
  const iv = Buffer.from(ivB64, 'base64url');
  const tag = Buffer.from(tagB64, 'base64url');
  const data = Buffer.from(dataB64, 'base64url');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

export type GatewayConfig = Record<string, string>;

export function parseConfig(value: unknown): GatewayConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const out: GatewayConfig = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (v == null) continue;
    out[k] = String(v);
  }
  return out;
}

/** Persist config: encrypt secret fields. */
export function sealConfig(fields: GatewayConfigField[], config: GatewayConfig): GatewayConfig {
  const out: GatewayConfig = {};
  for (const field of fields) {
    const value = config[field.key];
    if (value == null || !String(value).trim()) continue;
    out[field.key] = field.secret ? encryptSecret(String(value)) : String(value);
  }
  return out;
}

/** Runtime config: decrypt secret fields. Never send to browser. */
export function unsealConfig(fields: GatewayConfigField[], config: GatewayConfig): GatewayConfig {
  const out: GatewayConfig = {};
  for (const field of fields) {
    const value = config[field.key];
    if (value == null || !String(value).trim()) continue;
    out[field.key] = field.secret ? decryptSecret(String(value)) : String(value);
  }
  // Pass through unknown keys without decryption attempt if not encrypted.
  for (const [k, v] of Object.entries(config)) {
    if (out[k] !== undefined) continue;
    out[k] = v.startsWith(PREFIX) ? decryptSecret(v) : v;
  }
  return out;
}

export const SECRET_MASK = '••••••••';

export function maskedConfig(fields: GatewayConfigField[], config: GatewayConfig): GatewayConfig {
  const out: GatewayConfig = {};
  for (const field of fields) {
    const value = config[field.key];
    if (value == null || !String(value).trim()) continue;
    out[field.key] = field.secret ? SECRET_MASK : String(value);
  }
  return out;
}

export function publicConfig(fields: GatewayConfigField[], config: GatewayConfig): GatewayConfig {
  const out: GatewayConfig = {};
  for (const field of fields) {
    if (!field.public) continue;
    const value = config[field.key];
    if (value == null || !String(value).trim()) continue;
    // Public fields are never encrypted.
    out[field.key] = String(value).startsWith(PREFIX) ? '[redacted]' : String(value);
  }
  return out;
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Truncate payloads before DB/log storage. */
export function truncatePayload(input: string, max = 32_000): string {
  if (input.length <= max) return input;
  return `${input.slice(0, max)}…[truncated]`;
}

/** Strip known secret keys from objects before logging/storage. */
export function sanitizeForStorage(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeForStorage);
  if (!value || typeof value !== 'object') return value;
  const SENSITIVE = /(secret|password|passwd|signature_key|private|token|authorization|card|cvv|pan)/i;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE.test(k)) {
      out[k] = '[redacted]';
    } else {
      out[k] = sanitizeForStorage(v);
    }
  }
  return out;
}
