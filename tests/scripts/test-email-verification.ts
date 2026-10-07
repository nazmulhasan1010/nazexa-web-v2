import { formatFromAddress, isEmailConfigured } from '../../src/lib/email';
import { ConfigService } from '../../src/lib/config/service';
import { decryptSecret } from '../../src/lib/config/encryption';
import { db } from '../../src/lib/db';

async function runTests() {
  console.log('--- 1. Testing formatFromAddress ---');
  const tests = [
    { name: 'Nazexa', addr: 'Nazexa <onboarding@yourdomain.com>', expected: '"Nazexa" <onboarding@yourdomain.com>' },
    { name: '', addr: 'Nazexa <onboarding@yourdomain.com>', expected: '"Nazexa" <onboarding@yourdomain.com>' },
    { name: 'Nazexa Support', addr: 'support@nazexa.com', expected: '"Nazexa Support" <support@nazexa.com>' },
    { name: '', addr: 'admin@nazexa.com', expected: 'admin@nazexa.com' },
  ];

  for (const t of tests) {
    const res = formatFromAddress(t.name, t.addr);
    const passed = res === t.expected;
    console.log(`formatFromAddress("${t.name}", "${t.addr}") => "${res}" [${passed ? 'PASS' : 'FAIL'}]`);
    if (!passed) throw new Error(`Expected "${t.expected}" but got "${res}"`);
  }

  console.log('\n--- 2. Testing ConfigService Secret Preservation ---');
  const testKey = 'test.smtp.pass';
  const testSecret = 'OriginalSecretPassword123!';

  // Step 2a: Set original secret
  await ConfigService.updateConfig({
    key: testKey,
    category: 'Email',
    value: testSecret,
    isSecret: true,
  });

  const record1 = await db.systemConfig.findUnique({ where: { key: testKey } });
  if (!record1?.valueEncrypted || decryptSecret(record1.valueEncrypted) !== testSecret) {
    throw new Error('Initial secret was not saved correctly.');
  }
  console.log('Initial secret saved and verified:', decryptSecret(record1.valueEncrypted));

  // Step 2b: Update with bullet mask (simulating form submission without retyping)
  await ConfigService.updateConfig({
    key: testKey,
    category: 'Email',
    value: '••••••••••••••••••',
    isSecret: true,
  });

  const record2 = await db.systemConfig.findUnique({ where: { key: testKey } });
  if (!record2?.valueEncrypted || decryptSecret(record2.valueEncrypted) !== testSecret) {
    throw new Error('Secret was overwritten by bullet mask!');
  }
  console.log('Secret preserved after submitting bullet mask:', decryptSecret(record2.valueEncrypted), '[PASS]');

  // Step 2c: Update with empty string (simulating empty password input)
  await ConfigService.updateConfig({
    key: testKey,
    category: 'Email',
    value: '',
    isSecret: true,
  });

  const record3 = await db.systemConfig.findUnique({ where: { key: testKey } });
  if (!record3?.valueEncrypted || decryptSecret(record3.valueEncrypted) !== testSecret) {
    throw new Error('Secret was overwritten by empty string!');
  }
  console.log('Secret preserved after submitting empty string:', decryptSecret(record3.valueEncrypted), '[PASS]');

  // Step 2d: Update with new real password
  const newSecret = 'UpdatedNewPassword456!';
  await ConfigService.updateConfig({
    key: testKey,
    category: 'Email',
    value: newSecret,
    isSecret: true,
  });

  const record4 = await db.systemConfig.findUnique({ where: { key: testKey } });
  if (!record4?.valueEncrypted || decryptSecret(record4.valueEncrypted) !== newSecret) {
    throw new Error('New secret was not applied!');
  }
  console.log('New secret successfully updated:', decryptSecret(record4.valueEncrypted), '[PASS]');

  // Cleanup test key
  await db.systemConfig.delete({ where: { key: testKey } }).catch(() => {});
  await db.systemConfigLog.deleteMany({ where: { configKey: testKey } }).catch(() => {});

  console.log('\n--- 3. Testing isEmailConfigured() ---');
  const configured = await isEmailConfigured();
  console.log('isEmailConfigured() returned:', configured);

  console.log('\nAll tests completed successfully!');
}

runTests()
  .catch((err) => {
    console.error('Test failed with error:', err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
