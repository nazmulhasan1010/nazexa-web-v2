/**
 * Ensure bank_transfer sandbox gateway is enabled for local purchases.
 * Run: node scripts/ensure-bank-gateway.cjs
 */
const { PrismaClient } = require('@prisma/client');

async function main() {
  const db = new PrismaClient();
  const config = {
    bankName: 'Nazexa Sandbox Bank',
    accountName: 'Nazexa Payments',
    accountNumber: '1234567890',
    branch: 'Local Dev',
  };

  const row = await db.paymentGateway.upsert({
    where: { code: 'bank_transfer' },
    create: {
      code: 'bank_transfer',
      displayName: 'Bank Transfer',
      type: 'manual',
      isEnabled: true,
      environment: 'sandbox',
      sortOrder: 10,
      priority: 10,
      supportsRefund: false,
      supportsWebhook: false,
      supportsManualReview: true,
      supportedCurrencies: 'USD,BDT',
      allowedProducts: 'nazexa-db',
      instructions:
        'Transfer the exact amount, then submit your slip/reference. In sandbox, proof is auto-approved.',
      config,
    },
    update: {
      displayName: 'Bank Transfer',
      isEnabled: true,
      environment: 'sandbox',
      supportedCurrencies: 'USD,BDT',
      allowedProducts: 'nazexa-db',
      instructions:
        'Transfer the exact amount, then submit your slip/reference. In sandbox, proof is auto-approved.',
      config,
    },
  });

  // Ensure product plans exist for common slugs
  const plans = [
    {
      productCode: 'nazexa-db',
      planCode: 'starter',
      planName: 'Starter',
      currency: 'USD',
      amount: 9,
    },
    { productCode: 'nazexa-db', planCode: 'pro', planName: 'Pro', currency: 'USD', amount: 19 },
    {
      productCode: 'nazexa-db',
      planCode: 'business',
      planName: 'Business',
      currency: 'USD',
      amount: 49,
    },
    { productCode: 'nazexa-db', planCode: 'team', planName: 'Team', currency: 'USD', amount: 99 },
  ];
  for (const plan of plans) {
    await db.paymentProductPlan.upsert({
      where: {
        productCode_planCode_currency: {
          productCode: plan.productCode,
          planCode: plan.planCode,
          currency: plan.currency,
        },
      },
      create: { ...plan, interval: 'monthly', isActive: true },
      update: { planName: plan.planName, amount: plan.amount, isActive: true },
    });
  }

  // Ensure apps have webhook URL
  for (const clientId of ['nazexa-db', 'nazexa-db-design']) {
    await db.application.updateMany({
      where: { clientId },
      data: {
        status: 'active',
        allowedOrigins: 'http://localhost:8000',
        paymentWebhookUrl: 'http://localhost:8000/api/webhooks/payments',
      },
    });
  }

  console.log(
    JSON.stringify({
      ok: true,
      gateway: { code: row.code, enabled: row.isEnabled, env: row.environment },
      plans: plans.length,
    })
  );
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
