'use server';

import { ConfigService } from '@/lib/config/service';

export async function getSocialAuthConfigAction() {
  const googleEnabled = await ConfigService.getConfig<boolean>('oauth.google.enabled', false);
  const githubEnabled = await ConfigService.getConfig<boolean>('oauth.github.enabled', false);
  const emailPasswordEnabled = await ConfigService.getConfig<boolean>('auth.emailPasswordEnabled', true);
  const emailVerificationRequired = await ConfigService.getConfig<boolean>('auth.emailVerificationRequired', false);
  const registrationEnabled = await ConfigService.getConfig<boolean>('auth.registrationEnabled', true);
  const passwordResetEnabled = await ConfigService.getConfig<boolean>('auth.passwordResetEnabled', true);
  const ssoEnabled = await ConfigService.getConfig<boolean>('auth.ssoEnabled', true);
  
  return {
    google: googleEnabled,
    github: githubEnabled,
    emailPasswordEnabled,
    emailVerificationRequired,
    registrationEnabled,
    passwordResetEnabled,
    ssoEnabled,
    centralAuthEnabled: ssoEnabled,
  };
}

export async function getAuthConfigAction() {
  return getSocialAuthConfigAction();
}
