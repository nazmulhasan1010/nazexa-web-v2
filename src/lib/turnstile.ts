import { ConfigService } from './config/service';

export async function verifyTurnstile(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;

  const turnstileEnabled = await ConfigService.getConfig<boolean>('captcha.turnstile.enabled', false);

  if (!turnstileEnabled) {
    return true; // If disabled globally, bypass check
  }

  const secret = await ConfigService.getSecretConfig('captcha.turnstile.secretKey') || process.env.TURNSTILE_SECRET_KEY;
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
