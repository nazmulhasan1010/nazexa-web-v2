import { NextResponse } from 'next/server';
import { ConfigService } from '@/lib/config/service';

export async function GET() {
  try {
    const googleEnabled = await ConfigService.getConfig<boolean>('oauth.google.enabled', false);
    const githubEnabled = await ConfigService.getConfig<boolean>('oauth.github.enabled', false);

    const emailPasswordEnabled = await ConfigService.getConfig<boolean>('auth.emailPasswordEnabled', true);
    const emailVerificationRequired = await ConfigService.getConfig<boolean>('auth.emailVerificationRequired', false);
    const registrationEnabled = await ConfigService.getConfig<boolean>('auth.registrationEnabled', true);
    const passwordResetEnabled = await ConfigService.getConfig<boolean>('auth.passwordResetEnabled', true);
    const ssoEnabled = await ConfigService.getConfig<boolean>('auth.ssoEnabled', true);

    return NextResponse.json(
      {
        google: googleEnabled,
        github: githubEnabled,
        emailPasswordEnabled,
        emailVerificationRequired,
        registrationEnabled,
        passwordResetEnabled,
        ssoEnabled,
        centralAuthEnabled: ssoEnabled,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch social auth config:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
