import { db } from './db';

export async function verifyTurnstile(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;

  const config = await db.securitySettings.findUnique({
    where: { id: 'global' }
  });

  if (!config?.turnstileEnabled) {
    return true; // If disabled globally, bypass check
  }

  const secret = config.turnstileSecretKey;
  if (!secret) {
    console.warn('TURNSTILE_SECRET_KEY is missing from Security Settings.');
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification failed:', error);
    return false;
  }
}
