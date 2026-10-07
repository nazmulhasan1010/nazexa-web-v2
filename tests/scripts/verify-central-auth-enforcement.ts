/**
 * Comprehensive Automated Verification Script for Central Authentication Enforcement
 *
 * Tests dynamic policy enforcement across all 5 settings:
 * 1. auth.emailPasswordEnabled
 * 2. auth.registrationEnabled
 * 3. auth.emailVerificationRequired
 * 4. auth.passwordResetEnabled
 * 5. auth.ssoEnabled
 *
 * Runs against localhost:3000 API and verifies 403 Forbidden responses when disabled,
 * then restores system configs cleanly.
 */

import { ConfigService } from '../../src/lib/config/service';

const BASE_URL = 'http://localhost:3000';

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function setConfig(key: string, value: boolean) {
  await ConfigService.updateConfig({
    key,
    category: 'authentication',
    value,
    valueType: 'boolean',
    isPublic: true,
  });
}

async function runTests() {
  console.log('===============================================================');
  console.log('🚀 STARTING CENTRAL AUTHENTICATION ENFORCEMENT VERIFICATION');
  console.log('===============================================================\n');

  // Record initial values to restore later
  const originalValues = {
    'auth.emailPasswordEnabled': await ConfigService.getConfig<boolean>('auth.emailPasswordEnabled', true),
    'auth.registrationEnabled': await ConfigService.getConfig<boolean>('auth.registrationEnabled', true),
    'auth.emailVerificationRequired': await ConfigService.getConfig<boolean>('auth.emailVerificationRequired', false),
    'auth.passwordResetEnabled': await ConfigService.getConfig<boolean>('auth.passwordResetEnabled', true),
    'auth.ssoEnabled': await ConfigService.getConfig<boolean>('auth.ssoEnabled', true),
  };

  console.log('📋 Initial System Configuration:', originalValues);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${details ? `(${details})` : ''}`);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST SUITE 1: Social Config / Config Endpoint Broadcasting
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Testing Config Broadcasting Endpoints ---');
    const socialConfigRes = await fetch(`${BASE_URL}/api/auth/social-config`);
    const socialConfig = await socialConfigRes.json();
    assert(
      socialConfigRes.status === 200 &&
        typeof socialConfig.emailPasswordEnabled === 'boolean' &&
        typeof socialConfig.registrationEnabled === 'boolean' &&
        typeof socialConfig.emailVerificationRequired === 'boolean' &&
        typeof socialConfig.passwordResetEnabled === 'boolean' &&
        typeof socialConfig.ssoEnabled === 'boolean',
      'GET /api/auth/social-config exposes all 5 central auth properties',
      JSON.stringify(socialConfig),
    );

    const configEndpointRes = await fetch(`${BASE_URL}/api/auth/config`);
    const configEndpoint = await configEndpointRes.json();
    assert(
      configEndpointRes.status === 200 &&
        configEndpoint.ssoEnabled === socialConfig.ssoEnabled &&
        configEndpoint.emailPasswordEnabled === socialConfig.emailPasswordEnabled,
      'GET /api/auth/config matches /api/auth/social-config output',
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 2: Email / Password Login Enforcement
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing auth.emailPasswordEnabled Enforcement ---');
    await setConfig('auth.emailPasswordEnabled', false);
    await wait(200);

    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' }),
    });
    const loginData = await loginRes.json();
    assert(
      loginRes.status === 403 && loginData.code === 'EMAIL_PASSWORD_DISABLED',
      'POST /api/auth/login returns 403 EMAIL_PASSWORD_DISABLED when emailPasswordEnabled is false',
      `Status: ${loginRes.status}, Body: ${JSON.stringify(loginData)}`,
    );

    const registerWithEmailDisabledRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test-email-disabled@example.com',
        password: 'Password123!',
      }),
    });
    const registerWithEmailDisabledData = await registerWithEmailDisabledRes.json();
    assert(
      registerWithEmailDisabledRes.status === 403 &&
        registerWithEmailDisabledData.code === 'EMAIL_PASSWORD_DISABLED',
      'POST /api/auth/register returns 403 EMAIL_PASSWORD_DISABLED when emailPasswordEnabled is false',
      `Status: ${registerWithEmailDisabledRes.status}, Body: ${JSON.stringify(registerWithEmailDisabledData)}`,
    );

    // Re-enable email/password for subsequent tests
    await setConfig('auth.emailPasswordEnabled', true);
    await wait(200);

    // -------------------------------------------------------------------------
    // TEST SUITE 3: Public Registration Enforcement
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing auth.registrationEnabled Enforcement ---');
    await setConfig('auth.registrationEnabled', false);
    await wait(200);

    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Forbidden User',
        email: 'forbidden-register@example.com',
        password: 'Password123!',
      }),
    });
    const registerData = await registerRes.json();
    assert(
      registerRes.status === 403 && registerData.code === 'REGISTRATION_DISABLED',
      'POST /api/auth/register returns 403 REGISTRATION_DISABLED when registrationEnabled is false',
      `Status: ${registerRes.status}, Body: ${JSON.stringify(registerData)}`,
    );

    // Re-enable registration
    await setConfig('auth.registrationEnabled', true);
    await wait(200);

    // -------------------------------------------------------------------------
    // TEST SUITE 4: Password Reset Enforcement
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing auth.passwordResetEnabled Enforcement ---');
    await setConfig('auth.passwordResetEnabled', false);
    await wait(200);

    const forgotPasswordRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    const forgotPasswordData = await forgotPasswordRes.json();
    assert(
      forgotPasswordRes.status === 403 && forgotPasswordData.code === 'PASSWORD_RESET_DISABLED',
      'POST /api/auth/forgot-password returns 403 PASSWORD_RESET_DISABLED when passwordResetEnabled is false',
      `Status: ${forgotPasswordRes.status}, Body: ${JSON.stringify(forgotPasswordData)}`,
    );

    const resetPasswordRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'dummy-token', password: 'NewPassword123!' }),
    });
    const resetPasswordData = await resetPasswordRes.json();
    assert(
      resetPasswordRes.status === 403 && resetPasswordData.code === 'PASSWORD_RESET_DISABLED',
      'POST /api/auth/reset-password returns 403 PASSWORD_RESET_DISABLED when passwordResetEnabled is false',
      `Status: ${resetPasswordRes.status}, Body: ${JSON.stringify(resetPasswordData)}`,
    );

    // Re-enable password reset
    await setConfig('auth.passwordResetEnabled', true);
    await wait(200);

    // -------------------------------------------------------------------------
    // TEST SUITE 5: Central SSO Enforcement
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing auth.ssoEnabled Enforcement ---');
    await setConfig('auth.ssoEnabled', false);
    await wait(200);

    const ssoTokenRes = await fetch(`${BASE_URL}/api/auth/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: 'nazexa-db',
        client_secret: 'secret-db-design-123',
        grant_type: 'session_exchange',
        session_token: 'dummy-session-token',
      }),
    });
    const ssoTokenData = await ssoTokenRes.json();
    assert(
      ssoTokenRes.status === 403 && ssoTokenData.error === 'sso_disabled',
      'POST /api/auth/oauth/token returns 403 sso_disabled when ssoEnabled is false',
      `Status: ${ssoTokenRes.status}, Body: ${JSON.stringify(ssoTokenData)}`,
    );

    // Re-enable SSO
    await setConfig('auth.ssoEnabled', true);
    await wait(200);

    // -------------------------------------------------------------------------
    // TEST SUITE 6: Verification of Normal Operation After Re-enabling
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Testing Normal Re-enabled State ---');
    const finalSocialConfigRes = await fetch(`${BASE_URL}/api/auth/social-config`);
    const finalConfig = await finalSocialConfigRes.json();
    assert(
      finalConfig.emailPasswordEnabled === true &&
        finalConfig.registrationEnabled === true &&
        finalConfig.passwordResetEnabled === true &&
        finalConfig.ssoEnabled === true,
      'All 4 primary switches restored to true in central config',
      JSON.stringify(finalConfig),
    );

  } finally {
    // Clean restore
    console.log('\n🧹 Restoring Original Configuration Values...');
    for (const [key, val] of Object.entries(originalValues)) {
      await setConfig(key, val);
    }
    console.log('✅ Configuration Restored.');
  }

  console.log('\n===============================================================');
  console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  console.log('===============================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
