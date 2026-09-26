import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// We need a stable master key. If none is provided, we can either throw or use a fallback.
// In production, NAZEXA_INTERNAL_SECRET must be set.
function getMasterKey(): Buffer {
  const secret = process.env.NAZEXA_INTERNAL_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NAZEXA_INTERNAL_SECRET environment variable is missing.');
    }
    // Fallback for development only
    return crypto.scryptSync('dev-fallback-secret-do-not-use-in-prod', 'salt', 32);
  }
  
  // Ensure the key is exactly 32 bytes (256 bits)
  return crypto.scryptSync(secret, 'salt', 32);
}

export function encryptSecret(plainText: string): string {
  if (!plainText) return plainText;

  const iv = crypto.randomBytes(16);
  const key = getMasterKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptSecret(encryptedData: string): string {
  if (!encryptedData) return encryptedData;
  if (!encryptedData.includes(':')) {
    // Possibly unencrypted legacy data or corrupted data
    return encryptedData;
  }

  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }

    const [ivHex, authTagHex, contentHex] = parts;
    const key = getMasterKey();
    
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(ivHex, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    
    let decrypted = decipher.update(contentHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt secret. Ensure NAZEXA_INTERNAL_SECRET is correct.', error);
    // Depending on security requirements, we might want to throw or return null.
    // For now, return an empty string or throw to prevent accidental leak.
    throw new Error('Decryption failed');
  }
}
