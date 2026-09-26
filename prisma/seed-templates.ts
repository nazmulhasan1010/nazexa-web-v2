import { PrismaClient } from '@prisma/client';
import { compileEmailHtmlV2 } from '../src/lib/email/compiler-v2';
import { generateId } from '../src/lib/email/schema';

const prisma = new PrismaClient();

const settings = {
  width: 600,
  backgroundColor: '#ffffff',
  containerColor: '#ffffff',
  fontFamily: 'Inter, Arial, sans-serif',
  textColor: '#334155',
  primaryColor: '#0f172a',
  footerText: 'Thank you for choosing Nazexa,\nThe Nazexa Team',
  footerColor: '#64748b'
};

function createSection(blocks: any[], style: any = {}) {
  return {
    id: generateId(),
    layout: '100',
    style: { paddingTop: 16, paddingBottom: 16, paddingLeft: 0, paddingRight: 0, ...style },
    columns: [{
      id: generateId(),
      width: '100%',
      style: {},
      blocks
    }]
  };
}

const templates = [
  {
    key: 'subscription.active',
    name: 'Subscription Active',
    category: 'Billing',
    subject: 'Your subscription is now active!',
    description: 'Sent when a subscription starts',
    sections: [
      createSection([
        {
          id: generateId(),
          type: 'heading',
          content: { text: 'Plan Activated Successfully', level: 2 },
          style: { paddingTop: 8, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', textAlign: 'left' }
        },
        {
          id: generateId(),
          type: 'text',
          content: { text: 'Hello {{user.name}},\n\nGreat news! Your plan for **nazexa-db** has been successfully activated.' },
          style: { paddingTop: 8, paddingBottom: 24, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 16, lineHeight: 1.5, color: '#334155', textAlign: 'left' }
        }
      ], { paddingBottom: 0 }),
      createSection([
        {
          id: generateId(),
          type: 'heading',
          content: { text: 'Subscription Details', level: 3 },
          style: { paddingTop: 0, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 18, fontWeight: 'bold', color: '#166534', textAlign: 'left' }
        },
        {
          id: generateId(),
          type: 'table',
          content: {
            hasHeader: false,
            rows: [
              { id: generateId(), cells: ['Product:', '<b>nazexa-db</b>'] },
              { id: generateId(), cells: ['Plan:', '<b>{{subscription.plan}}</b>'] },
              { id: generateId(), cells: ['Activation Date:', '{{currentDate}}'] },
              { id: generateId(), cells: ['Payment Ref:', '{{payment.transactionId}}'] }
            ]
          },
          table: { borderColor: 'transparent', cellPadding: 8, headerBg: 'transparent', headerColor: '#166534', stripedRows: false, align: 'left' },
          style: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 },
          typography: { color: '#166534', fontSize: 15 }
        }
      ], { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 8, paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24 }),
      createSection([
        {
          id: generateId(),
          type: 'text',
          content: { text: 'You can now log in to your dashboard and start using your premium features.' },
          style: { paddingTop: 24, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 16, lineHeight: 1.5, color: '#334155', textAlign: 'left' }
        },
        {
          id: generateId(),
          type: 'button',
          content: { text: 'Go to Dashboard', url: '{{company.website}}/dashboard', newTab: true },
          button: { backgroundColor: '#0f172a', textColor: '#ffffff', borderRadius: 6, paddingTop: 12, paddingBottom: 12, paddingLeft: 24, paddingRight: 24, align: 'left' },
          style: { paddingTop: 16, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 16, fontWeight: 'bold' }
        }
      ], { paddingTop: 0 })
    ]
  },
  {
    key: 'billing.invoice',
    name: 'Invoice / Receipt',
    category: 'Billing',
    subject: 'Payment Successful',
    description: 'Sent for successful payments',
    sections: [
      createSection([
        {
          id: generateId(),
          type: 'heading',
          content: { text: 'Payment Successful', level: 2 },
          style: { paddingTop: 8, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', textAlign: 'left' }
        },
        {
          id: generateId(),
          type: 'text',
          content: { text: 'Hello {{user.name}},\n\nYour payment for **nazexa-db — {{subscription.plan}}** has been successfully processed.' },
          style: { paddingTop: 8, paddingBottom: 24, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 16, lineHeight: 1.5, color: '#334155', textAlign: 'left' }
        }
      ], { paddingBottom: 0 }),
      createSection([
        {
          id: generateId(),
          type: 'table',
          content: {
            hasHeader: false,
            rows: [
              { id: generateId(), cells: ['Transaction ID:', '{{payment.transactionId}}'] },
              { id: generateId(), cells: ['Amount:', '<b>{{payment.currency}} {{payment.amount}}</b>'] },
              { id: generateId(), cells: ['Payment Method:', '{{payment.method}}'] },
              { id: generateId(), cells: ['Date:', '{{currentDate}}'] },
              { id: generateId(), cells: ['Status:', '<b style="color: #10b981;">SUCCESS</b>'] }
            ]
          },
          table: { borderColor: 'transparent', cellPadding: 8, headerBg: 'transparent', headerColor: '#64748b', stripedRows: false, align: 'left' },
          style: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 },
          typography: { color: '#64748b', fontSize: 15 }
        }
      ], { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 8, paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24 }),
      createSection([
        {
          id: generateId(),
          type: 'text',
          content: { text: 'If your plan requires activation, it is currently being processed. You will receive a separate confirmation once your plan is active.' },
          style: { paddingTop: 24, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 16, lineHeight: 1.5, color: '#334155', textAlign: 'left' }
        }
      ], { paddingTop: 0 })
    ]
  },
  {
    key: 'auth.password-reset',
    name: 'Password Reset Request',
    category: 'Authentication',
    subject: 'Password Reset Request',
    description: 'Sent when a user requests a password reset',
    sections: [
      createSection([
        {
          id: generateId(),
          type: 'heading',
          content: { text: 'Reset Your Password', level: 2 },
          style: { paddingTop: 8, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', textAlign: 'left' }
        },
        {
          id: generateId(),
          type: 'text',
          content: { text: 'Hello {{user.name}},\n\nWe received a request to reset your password. Click the button below to choose a new one.' },
          style: { paddingTop: 8, paddingBottom: 24, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 16, lineHeight: 1.5, color: '#334155', textAlign: 'left' }
        },
        {
          id: generateId(),
          type: 'button',
          content: { text: 'Reset Password', url: '{{passwordReset.url}}', newTab: true },
          button: { backgroundColor: '#0f172a', textColor: '#ffffff', borderRadius: 6, paddingTop: 12, paddingBottom: 12, paddingLeft: 24, paddingRight: 24, align: 'left' },
          style: { paddingTop: 16, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 16, fontWeight: 'bold' }
        },
        {
          id: generateId(),
          type: 'text',
          content: { text: "If you didn't request this, you can safely ignore this email." },
          style: { paddingTop: 16, paddingBottom: 8, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 14, color: '#64748b', textAlign: 'left' }
        }
      ])
    ]
  },
  {
    key: 'account.active',
    name: 'Account Active',
    category: 'Account',
    subject: 'Welcome to {{company.name}}!',
    description: 'Sent when a new account is activated',
    sections: [
      createSection([
        {
          id: generateId(),
          type: 'heading',
          content: { text: 'Welcome, {{user.firstName}}!', level: 2 },
          style: { paddingTop: 8, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', textAlign: 'left' }
        },
        {
          id: generateId(),
          type: 'text',
          content: { text: 'Your account is now active and ready to use. Dive in and explore all the features we have to offer.' },
          style: { paddingTop: 8, paddingBottom: 24, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 16, lineHeight: 1.5, color: '#334155', textAlign: 'left' }
        },
        {
          id: generateId(),
          type: 'button',
          content: { text: 'Login to your account', url: '{{login.url}}', newTab: true },
          button: { backgroundColor: '#0f172a', textColor: '#ffffff', borderRadius: 6, paddingTop: 12, paddingBottom: 12, paddingLeft: 24, paddingRight: 24, align: 'left' },
          style: { paddingTop: 16, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 16, fontWeight: 'bold' }
        }
      ])
    ]
  },
  {
    key: 'account.suspended',
    name: 'Account Suspended',
    category: 'Account',
    subject: 'Action Required: Your account has been suspended',
    description: 'Sent when an account is suspended',
    sections: [
      createSection([
        {
          id: generateId(),
          type: 'heading',
          content: { text: 'Account Suspended', level: 2 },
          style: { paddingTop: 8, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 24, fontWeight: 'bold', color: '#dc2626', textAlign: 'left' }
        },
        {
          id: generateId(),
          type: 'text',
          content: { text: 'Hello {{user.name}},\n\nYour account has been temporarily suspended. Please review the details below or contact support.' },
          style: { paddingTop: 8, paddingBottom: 24, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 16, lineHeight: 1.5, color: '#334155', textAlign: 'left' }
        },
        {
          id: generateId(),
          type: 'button',
          content: { text: 'Contact Support', url: '{{ticket.url}}', newTab: true },
          button: { backgroundColor: '#0f172a', textColor: '#ffffff', borderRadius: 6, paddingTop: 12, paddingBottom: 12, paddingLeft: 24, paddingRight: 24, align: 'left' },
          style: { paddingTop: 16, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 16, fontWeight: 'bold' }
        }
      ])
    ]
  },
  {
    key: 'support.ticket-created',
    name: 'Support Ticket Received',
    category: 'Support',
    subject: 'Ticket Received: {{ticket.subject}}',
    description: 'Sent when a user creates a support ticket',
    sections: [
      createSection([
        {
          id: generateId(),
          type: 'heading',
          content: { text: 'We received your request', level: 2 },
          style: { paddingTop: 8, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', textAlign: 'left' }
        },
        {
          id: generateId(),
          type: 'text',
          content: { text: 'Hello {{user.name}},\n\nWe have received your support request regarding **{{ticket.subject}}**. Our team will review it and get back to you shortly.\n\nTicket ID: {{ticket.id}}' },
          style: { paddingTop: 8, paddingBottom: 24, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 16, lineHeight: 1.5, color: '#334155', textAlign: 'left' }
        },
        {
          id: generateId(),
          type: 'button',
          content: { text: 'View Ticket', url: '{{ticket.url}}', newTab: true },
          button: { backgroundColor: '#0f172a', textColor: '#ffffff', borderRadius: 6, paddingTop: 12, paddingBottom: 12, paddingLeft: 24, paddingRight: 24, align: 'left' },
          style: { paddingTop: 16, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
          typography: { fontSize: 16, fontWeight: 'bold' }
        }
      ])
    ]
  }
];

async function main() {
  console.log('Seeding templates...');
  
  const superAdmin = await prisma.adminUser.findFirst({ where: { role: 'super_admin' } });
  if (!superAdmin) {
    throw new Error('No super_admin found to assign templates to');
  }

  for (const tpl of templates) {
    const designJsonObj = {
      version: 2,
      settings,
      sections: tpl.sections
    };

    const designJson = JSON.stringify(designJsonObj);
    const contentHtml = compileEmailHtmlV2(designJsonObj as any);

    await prisma.systemEmailTemplate.upsert({
      where: { key: tpl.key },
      update: {
        name: tpl.name,
        category: tpl.category,
        subject: tpl.subject,
        description: tpl.description,
        designJson,
        contentHtml,
        updatedBy: superAdmin.id
      },
      create: {
        key: tpl.key,
        name: tpl.name,
        category: tpl.category,
        subject: tpl.subject,
        description: tpl.description,
        designJson,
        contentHtml,
        status: 'published',
        createdBy: superAdmin.id,
        updatedBy: superAdmin.id
      }
    });

    console.log(`Upserted template: ${tpl.key}`);
  }

  console.log('Seeding complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
