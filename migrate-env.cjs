const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

function encrypt(text) {
  const ALGORITHM = 'aes-256-gcm';
  const secret = process.env.NAZEXA_INTERNAL_SECRET || 'nazexa-5432';
  const key = crypto.scryptSync(secret, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

async function main() {
  const configs = [
    { key: 'oauth.google.clientId', category: 'OAuth', valuePlain: process.env.GOOGLE_CLIENT_ID },
    { key: 'oauth.google.clientSecret', category: 'OAuth', valueEncrypted: process.env.GOOGLE_CLIENT_SECRET ? encrypt(process.env.GOOGLE_CLIENT_SECRET) : null, isSecret: true },
    { key: 'oauth.google.redirectUri', category: 'OAuth', valuePlain: process.env.GOOGLE_REDIRECT_URI },
    { key: 'oauth.github.clientId', category: 'OAuth', valuePlain: process.env.GITHUB_CLIENT_ID },
    { key: 'oauth.github.clientSecret', category: 'OAuth', valueEncrypted: process.env.GITHUB_CLIENT_SECRET ? encrypt(process.env.GITHUB_CLIENT_SECRET) : null, isSecret: true },
    
    { key: 'smtp.host', category: 'Email', valuePlain: process.env.SMTP_HOST },
    { key: 'smtp.port', category: 'Email', valuePlain: process.env.SMTP_PORT, valueType: 'number' },
    { key: 'smtp.user', category: 'Email', valuePlain: process.env.SMTP_USER },
    { key: 'smtp.pass', category: 'Email', valueEncrypted: process.env.SMTP_PASS ? encrypt(process.env.SMTP_PASS) : null, isSecret: true },
    { key: 'email.from.address', category: 'Email', valuePlain: process.env.EMAIL_FROM },
    
    { key: 'socket.url', category: 'Realtime', valuePlain: process.env.NEXT_PUBLIC_SOCKET_URL },
    { key: 'socket.projectId', category: 'Realtime', valuePlain: process.env.NEXT_PUBLIC_SOCKET_PROJECT_ID },
    { key: 'socket.secretKey', category: 'Realtime', valueEncrypted: process.env.SOCKET_SECRET_KEY ? encrypt(process.env.SOCKET_SECRET_KEY) : null, isSecret: true },
    
    { key: 'captcha.turnstile.siteKey', category: 'CAPTCHA', valuePlain: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY },
    { key: 'captcha.turnstile.secretKey', category: 'CAPTCHA', valueEncrypted: process.env.TURNSTILE_SECRET_KEY ? encrypt(process.env.TURNSTILE_SECRET_KEY) : null, isSecret: true }
  ];

  for (const c of configs) {
    if (!c.valuePlain && !c.valueEncrypted) continue; // skip null
    await prisma.systemConfig.upsert({
      where: { key: c.key },
      update: c,
      create: c
    });
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
