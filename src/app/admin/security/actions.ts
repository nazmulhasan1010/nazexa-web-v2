'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateSecuritySettings(data: {
  enabled: boolean;
  siteKey: string;
  secretKey: string;
}) {
  try {
    const updateData: any = {
      turnstileEnabled: data.enabled,
      turnstileSiteKey: data.siteKey || null,
    };
    if (data.secretKey) {
      updateData.turnstileSecretKey = data.secretKey;
    }

    await db.securitySettings.upsert({
      where: { id: 'global' },
      update: updateData,
      create: {
        id: 'global',
        turnstileEnabled: data.enabled,
        turnstileSiteKey: data.siteKey || null,
        turnstileSecretKey: data.secretKey || null,
      },
    });

    revalidatePath('/admin/security');
    return { success: true };
  } catch (error) {
    console.error('Failed to update security settings', error);
    return { success: false, error: 'Failed to update' };
  }
}
