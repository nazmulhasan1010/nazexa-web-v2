export type VariableType = 'string' | 'number' | 'date' | 'url';

export interface EmailVariable {
  key: string;
  label: string;
  description: string;
  category: string;
  dataType: VariableType;
  required?: boolean;
  exampleValue: string;
}

export const EMAIL_VARIABLES: EmailVariable[] = [
  // User
  { key: 'user.name', label: 'Name', description: 'Recipient full name', category: 'User', dataType: 'string', exampleValue: 'Nazmul Hasan' },
  { key: 'user.firstName', label: 'First Name', description: 'Recipient first name', category: 'User', dataType: 'string', exampleValue: 'Nazmul' },
  { key: 'user.lastName', label: 'Last Name', description: 'Recipient last name', category: 'User', dataType: 'string', exampleValue: 'Hasan' },
  { key: 'user.email', label: 'Email', description: 'Recipient email address', category: 'User', dataType: 'string', exampleValue: 'nazmul@example.com' },
  
  // Authentication
  { key: 'verification.url', label: 'Verification URL', description: 'Link to verify email', category: 'Authentication', dataType: 'url', exampleValue: 'https://nazexa.com/verify?token=123' },
  { key: 'verification.code', label: 'Verification Code', description: '6-digit OTP code', category: 'Authentication', dataType: 'string', exampleValue: '593021' },
  { key: 'passwordReset.url', label: 'Password Reset URL', description: 'Link to reset password', category: 'Authentication', dataType: 'url', exampleValue: 'https://nazexa.com/reset?token=123' },
  { key: 'login.url', label: 'Login URL', description: 'Link to sign in', category: 'Authentication', dataType: 'url', exampleValue: 'https://nazexa.com/login' },

  // Company
  { key: 'company.name', label: 'Company Name', description: 'Your company name', category: 'Company', dataType: 'string', exampleValue: 'Nazexa' },
  { key: 'company.website', label: 'Website', description: 'Company website URL', category: 'Company', dataType: 'url', exampleValue: 'https://nazexa.com' },
  { key: 'company.email', label: 'Support Email', description: 'Company support email', category: 'Company', dataType: 'string', exampleValue: 'support@nazexa.com' },
  { key: 'company.address', label: 'Address', description: 'Company physical address', category: 'Company', dataType: 'string', exampleValue: '123 Tech Ave, Suite 100, NY' },

  // Payment
  { key: 'payment.amount', label: 'Amount', description: 'Transaction amount (formatted)', category: 'Payment', dataType: 'string', exampleValue: '$49.00' },
  { key: 'payment.currency', label: 'Currency', description: 'Currency code', category: 'Payment', dataType: 'string', exampleValue: 'USD' },
  { key: 'payment.transactionId', label: 'Transaction ID', description: 'Unique payment ID', category: 'Payment', dataType: 'string', exampleValue: 'TXN-987654321' },
  { key: 'payment.status', label: 'Status', description: 'Payment status', category: 'Payment', dataType: 'string', exampleValue: 'Paid' },
  { key: 'payment.method', label: 'Method', description: 'Payment method', category: 'Payment', dataType: 'string', exampleValue: 'Credit Card (Visa ending in 4242)' },

  // Subscription
  { key: 'subscription.plan', label: 'Plan Name', description: 'Name of the subscription plan', category: 'Subscription', dataType: 'string', exampleValue: 'Pro Tier' },
  { key: 'subscription.status', label: 'Status', description: 'Subscription status', category: 'Subscription', dataType: 'string', exampleValue: 'Active' },
  { key: 'subscription.expiresAt', label: 'Expiration Date', description: 'Date the subscription ends', category: 'Subscription', dataType: 'date', exampleValue: 'December 31, 2026' },

  // Support
  { key: 'ticket.id', label: 'Ticket ID', description: 'Support ticket number', category: 'Support', dataType: 'string', exampleValue: '#T-10492' },
  { key: 'ticket.subject', label: 'Subject', description: 'Ticket subject line', category: 'Support', dataType: 'string', exampleValue: 'Cannot connect to SMTP' },
  { key: 'ticket.url', label: 'Ticket URL', description: 'Link to view the ticket', category: 'Support', dataType: 'url', exampleValue: 'https://nazexa.com/support/T-10492' },

  // System
  { key: 'currentYear', label: 'Current Year', description: 'The current 4-digit year', category: 'System', dataType: 'string', exampleValue: new Date().getFullYear().toString() },
  { key: 'currentDate', label: 'Current Date', description: 'Formatted current date', category: 'System', dataType: 'date', exampleValue: new Date().toLocaleDateString() },
];
