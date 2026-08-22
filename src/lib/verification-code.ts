/**
 * Email verification code — generate, store (hashed), verify, rate-limit resends.
 *
 * Codes are 6-digit numeric strings. The raw code is emailed to the user; only
 * the bcrypt hash is persisted (same security pattern as password-reset tokens).
 *
 * Expiry: 5 minutes.
 * Resend rate limit: 5 per hour per user.
 */

import { randomInt } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

const CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CODES_PER_HOUR = 5;
const BCRYPT_COST = 10; // lower than passwords — codes are short-lived

/**
 * Generate a 6-digit verification code, store its hash in the DB, and return
 * the raw code for emailing.
 *
 * Deletes any existing codes for this user first.
 */
export async function generateVerificationCode(
  userId: string,
  email: string
): Promise<{ code: string; rateLimited: false } | { code: null; rateLimited: true }> {
  // Rate limit: count codes created in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await db.emailVerificationCode.count({
    where: { userId, createdAt: { gte: oneHourAgo } },
  });

  if (recentCount >= MAX_CODES_PER_HOUR) {
    return { code: null, rateLimited: true };
  }

  // Cooldown check: if a code was created less than 60s ago, return existing or skip duplicate generation
  const existingCode = await db.emailVerificationCode.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  if (existingCode && Date.now() - existingCode.createdAt.getTime() < 60 * 1000) {
    // A code was sent less than 60 seconds ago — keep existing code valid without re-sending
    return { code: null, rateLimited: false, cooldown: true } as any;
  }

  // Delete previous codes for this user
  await db.emailVerificationCode.deleteMany({ where: { userId } });

  // Generate 6-digit code
  const rawCode = String(randomInt(100000, 999999));
  const codeHash = await bcrypt.hash(rawCode, BCRYPT_COST);

  await db.emailVerificationCode.create({
    data: {
      userId,
      email: email.toLowerCase().trim(),
      code: codeHash,
      expiresAt: new Date(Date.now() + CODE_EXPIRY_MS),
    },
  });

  return { code: rawCode, rateLimited: false };
}

/**
 * Verify a code entered by the user. On success, marks the user as verified
 * and deletes the code record.
 *
 * Returns `{ verified: true }` or `{ verified: false, reason }`.
 */
export async function verifyCode(
  userId: string,
  rawCode: string
): Promise<{ verified: true } | { verified: false; reason: string }> {
  const record = await db.emailVerificationCode.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return {
      verified: false,
      reason: 'No verification code found. Please request a new one.',
    };
  }

  if (record.expiresAt < new Date()) {
    await db.emailVerificationCode.deleteMany({ where: { userId } });
    return {
      verified: false,
      reason: 'Verification code has expired. Please request a new one.',
    };
  }

  const valid = await bcrypt.compare(rawCode.trim(), record.code);
  if (!valid) {
    return {
      verified: false,
      reason: 'Invalid verification code. Please try again.',
    };
  }

  // Mark user as verified and clean up
  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    }),
    db.emailVerificationCode.deleteMany({ where: { userId } }),
  ]);

  return { verified: true };
}

/**
 * Check whether a user's email is verified.
 */
export async function isUserVerified(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });
  return user?.emailVerified !== null && user?.emailVerified !== undefined;
}
