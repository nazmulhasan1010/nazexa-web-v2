const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const mapping = {
  aiproviderconfig: 'AiProviderConfig',
  aiagent: 'AiAgent',
  admin_audit_logs: 'AdminAuditLog',
  admin_roles: 'AdminRole',
  admin_sessions: 'AdminSession',
  admin_users: 'AdminUser',
  ai_jobs: 'AiJob',
  manual_payment_proofs: 'ManualPaymentProof',
  payment_attempts: 'PaymentAttempt',
  payment_gateways: 'PaymentGateway',
  payment_product_plans: 'PaymentProductPlan',
  payment_refunds: 'PaymentRefund',
  payment_transactions: 'PaymentTransaction',
  payment_webhook_events: 'PaymentWebhookEvent',
};

for (const [snake, pascal] of Object.entries(mapping)) {
  const modelRegex = new RegExp(`model \\b${snake}\\b \\{`, 'g');
  schema = schema.replace(modelRegex, `model ${pascal} {`);

  const blockEndRegex = new RegExp(`(model \\b${pascal}\\b \\{[\\s\\S]*?)\\}`, 'g');
  schema = schema.replace(blockEndRegex, `$1  @@map("${snake}")\n}`);

  // Need to replace the relation type. e.g. "field  snake_case" -> "field  PascalCase"
  // e.g. "admin_users admin_users @relation" -> "admin_users AdminUser @relation"
  // Also arrays like "admin_users admin_users[]" -> "admin_users AdminUser[]"
  const relationRegex = new RegExp(`(\\n\\s+\\w+\\s+)${snake}(\\[\\])?`, 'g');
  schema = schema.replace(relationRegex, `$1${pascal}$2`);
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Done!');
