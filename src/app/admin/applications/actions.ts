'use server';

import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin-auth.server';
import crypto from 'crypto';

export async function getApplications() {
  const session = await getAdminSession();
  if (!session || session.user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const applications = await db.application.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return applications;
}

export async function createApplication(data: {
  name: string;
  clientId: string;
  redirectUris: string;
  allowedOrigins?: string;
  paymentWebhookUrl?: string;
}) {
  const session = await getAdminSession();
  if (!session || session.user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const existing = await db.application.findUnique({ where: { clientId: data.clientId } });
  if (existing) {
    throw new Error('Application with this Client ID already exists');
  }

  // Generate a strong client secret
  const clientSecret = crypto.randomBytes(32).toString('hex');

  const app = await db.application.create({
    data: {
      name: data.name,
      clientId: data.clientId,
      clientSecret,
      redirectUris: data.redirectUris,
      allowedOrigins: data.allowedOrigins || null,
      paymentWebhookUrl: data.paymentWebhookUrl || null,
      status: 'active',
    },
  });

  return { success: true, app };
}

export async function updateApplication(
  id: string,
  data: {
    name?: string;
    status?: string;
    redirectUris?: string;
    allowedOrigins?: string;
    paymentWebhookUrl?: string;
  }
) {
  const session = await getAdminSession();
  if (!session || session.user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  await db.application.update({
    where: { id },
    data,
  });

  return { success: true };
}

export async function deleteApplication(id: string) {
  const session = await getAdminSession();
  if (!session || session.user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  await db.application.delete({
    where: { id },
  });

  return { success: true };
}

export async function rotateClientSecret(id: string) {
  const session = await getAdminSession();
  if (!session || session.user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const clientSecret = crypto.randomBytes(32).toString('hex');

  const app = await db.application.update({
    where: { id },
    data: { clientSecret },
  });

  return { success: true, clientSecret: app.clientSecret };
}
