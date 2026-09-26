'use server';

import { ConfigService, ConfigValueType } from '@/lib/config/service';
import { getAdminSession } from '@/lib/admin-auth.server';
import { revalidatePath } from 'next/cache';

export async function saveConfigAction(configs: Array<{
  key: string;
  category: string;
  value: any;
  valueType?: string;
  isSecret?: boolean;
  isPublic?: boolean;
  description?: string;
}>) {
  try {
    const session = await getAdminSession();
    if (!session?.user) throw new Error('Unauthorized');
    const admin = session.user;
    
    // Process sequentially or Promise.all
    await Promise.all(
      configs.map(config => 
        ConfigService.updateConfig({
          ...config,
          actorId: admin.id,
          actorName: admin.name || admin.email
        })
      )
    );
    
    revalidatePath('/admin/configuration');
    revalidatePath('/admin/configuration/[...slug]', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving configs:', error);
    return { success: false, error: error.message };
  }
}

export async function getConfigMapAction(keys: string[]) {
  try {
    const session = await getAdminSession();
    if (!session?.user) throw new Error('Unauthorized');
    
    const map: Record<string, any> = {};
    for (const key of keys) {
      // getPublicConfig fetches from DB then falls back to env, so it works perfectly.
      // Wait, getSecretConfig doesn't return the real secret for UI, but ConfigService.getConfig does?
      // Actually, we shouldn't send real secrets to the client. We will return '********' if it's a secret.
      const config = await ConfigService.getConfig(key);
      const isSecret = await ConfigService.getConfig(key).then(() => false); // We don't know if it's secret easily without querying the DB object directly.
      
      // Let's just fetch the DB records
      const dbConfig = await import('@/lib/db').then(m => m.db.systemConfig.findUnique({ where: { key } }));
      if (dbConfig?.isSecret) {
         map[key] = '••••••••••••••••••';
      } else {
         map[key] = await ConfigService.getConfig(key);
      }
    }
    return { success: true, data: map };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
