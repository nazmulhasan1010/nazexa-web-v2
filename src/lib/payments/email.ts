import { sendEmail } from '@/lib/email';
import { db } from '@/lib/db';

export async function sendPaymentSuccessEmail(transactionId: string) {
  try {
    const txn = await db.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { users: true, payment_gateways: true },
    });

    if (!txn) return;

    // Safety check: ensure we only send this for PAID transactions
    if (txn.status !== 'PAID') {
      console.warn(
        `[email] Skipping payment success email for txn ${txn.publicId} as status is ${txn.status}`
      );
      return;
    }

    const gatewayName =
      txn.payment_gateways?.displayName || txn.payment_gateways?.code || 'Nazexa Payment';
    const amountStr = `${txn.currency} ${txn.amount.toString()}`;
    const dateStr = (txn.paidAt || txn.updatedAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0f172a;">Payment Successful</h2>
        <p>Hello ${txn.users.name || 'Customer'},</p>
        <p>Your payment for <strong>${txn.product} — ${txn.plan}</strong> has been successfully processed.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #64748b;">Transaction ID:</td><td style="padding: 4px 0; font-family: monospace;">${txn.publicId}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Amount:</td><td style="padding: 4px 0; font-weight: bold;">${amountStr}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Payment Method:</td><td style="padding: 4px 0;">${gatewayName}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Date:</td><td style="padding: 4px 0;">${dateStr}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Status:</td><td style="padding: 4px 0; color: #10b981; font-weight: bold;">SUCCESS</td></tr>
          </table>
        </div>
        
        <p>If your plan requires activation, it is currently being processed. You will receive a separate confirmation once your plan is active.</p>
        
        <p style="margin-top: 40px; font-size: 14px; color: #64748b;">
          Thank you,<br/>The Nazexa Team
        </p>
      </div>
    `;

    await sendEmail({
      to: txn.users.email,
      subject: `Payment Successful: ${txn.product} — ${txn.plan}`,
      html,
    });
  } catch (error) {
    console.error(`[email] Failed to send payment success email for ${transactionId}:`, error);
  }
}

export async function sendPlanActivatedEmail(transactionId: string) {
  try {
    const txn = await db.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { users: true },
    });

    if (!txn) return;

    // Safety check
    if (txn.fulfillmentStatus !== 'FULFILLED') {
      console.warn(
        `[email] Skipping plan activation email for txn ${txn.publicId} as fulfillmentStatus is ${txn.fulfillmentStatus}`
      );
      return;
    }

    const dateStr = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0f172a;">Plan Activated Successfully</h2>
        <p>Hello ${txn.users.name || 'Customer'},</p>
        <p>Great news! Your plan for <strong>${txn.product}</strong> has been successfully activated.</p>
        
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #166534; font-size: 16px;">Subscription Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #166534;">Product:</td><td style="padding: 4px 0; font-weight: bold; color: #14532d;">${txn.product}</td></tr>
            <tr><td style="padding: 4px 0; color: #166534;">Plan:</td><td style="padding: 4px 0; font-weight: bold; color: #14532d;">${txn.plan}</td></tr>
            <tr><td style="padding: 4px 0; color: #166534;">Activation Date:</td><td style="padding: 4px 0; color: #14532d;">${dateStr}</td></tr>
            <tr><td style="padding: 4px 0; color: #166534;">Payment Ref:</td><td style="padding: 4px 0; font-family: monospace; color: #14532d;">${txn.publicId}</td></tr>
          </table>
        </div>
        
        <p>You can now log in to your dashboard and start using your premium features.</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://nazexa.com'}/dashboard" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
        </div>
        
        <p style="margin-top: 40px; font-size: 14px; color: #64748b;">
          Thank you for choosing Nazexa,<br/>The Nazexa Team
        </p>
      </div>
    `;

    await sendEmail({
      to: txn.users.email,
      subject: `Your ${txn.product} plan is now active!`,
      html,
    });
  } catch (error) {
    console.error(`[email] Failed to send plan activation email for ${transactionId}:`, error);
  }
}

export async function sendAdminPaymentSuccessEmail(transactionId: string) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    const txn = await db.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { users: true, payment_gateways: true },
    });

    if (!txn || txn.status !== 'PAID') return;

    const gatewayName =
      txn.payment_gateways?.displayName || txn.payment_gateways?.code || 'Nazexa Payment';
    const amountStr = `${txn.currency} ${txn.amount.toString()}`;
    const dateStr = (txn.paidAt || txn.updatedAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0f172a;">New Payment Received</h2>
        <p>A user has successfully purchased a plan.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <tr><td style="padding: 4px 0; color: #64748b;">User:</td><td style="padding: 4px 0;">${txn.users.name || 'N/A'} (${txn.users.email})</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Product:</td><td style="padding: 4px 0;">${txn.product}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Plan:</td><td style="padding: 4px 0;">${txn.plan}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Amount:</td><td style="padding: 4px 0; font-weight: bold;">${amountStr}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Payment Method:</td><td style="padding: 4px 0;">${gatewayName}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Transaction ID:</td><td style="padding: 4px 0; font-family: monospace;">${txn.publicId}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Date:</td><td style="padding: 4px 0;">${dateStr}</td></tr>
          </table>
        </div>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `New Payment Received: ${amountStr} for ${txn.product}`,
      html,
    });
  } catch (error) {
    console.error(
      `[email] Failed to send admin payment success email for ${transactionId}:`,
      error
    );
  }
}

export async function sendAdminCustomPaymentPendingEmail(transactionId: string) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    const txn = await db.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { users: true, payment_gateways: true },
    });

    if (!txn || (txn.status !== 'PENDING' && txn.status !== 'PENDING_REVIEW')) return;

    const gatewayName =
      txn.payment_gateways?.displayName || txn.payment_gateways?.code || 'Custom Payment';
    const amountStr = `${txn.currency} ${txn.amount.toString()}`;
    const dateStr = txn.createdAt.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let userRef = 'N/A';
    if (txn.details && typeof txn.details === 'object' && 'reference' in txn.details) {
      userRef = (txn.details as any).reference || 'N/A';
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0f172a;">Action Required: Pending Custom Payment</h2>
        <p>A user has submitted a custom payment and admin approval is required.</p>
        
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <tr><td style="padding: 4px 0; color: #b45309;">User:</td><td style="padding: 4px 0;">${txn.users.name || 'N/A'} (${txn.users.email})</td></tr>
            <tr><td style="padding: 4px 0; color: #b45309;">Product:</td><td style="padding: 4px 0;">${txn.product}</td></tr>
            <tr><td style="padding: 4px 0; color: #b45309;">Plan:</td><td style="padding: 4px 0;">${txn.plan}</td></tr>
            <tr><td style="padding: 4px 0; color: #b45309;">Amount:</td><td style="padding: 4px 0; font-weight: bold;">${amountStr}</td></tr>
            <tr><td style="padding: 4px 0; color: #b45309;">Method:</td><td style="padding: 4px 0;">${gatewayName}</td></tr>
            <tr><td style="padding: 4px 0; color: #b45309;">User Reference:</td><td style="padding: 4px 0; font-family: monospace;">${userRef}</td></tr>
            <tr><td style="padding: 4px 0; color: #b45309;">Transaction ID:</td><td style="padding: 4px 0; font-family: monospace;">${txn.publicId}</td></tr>
            <tr><td style="padding: 4px 0; color: #b45309;">Status:</td><td style="padding: 4px 0; font-weight: bold;">PENDING</td></tr>
            <tr><td style="padding: 4px 0; color: #b45309;">Date:</td><td style="padding: 4px 0;">${dateStr}</td></tr>
          </table>
        </div>
        
        <p>Please review and approve or reject this payment in the Nazexa Web Admin Panel.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://nazexa.com'}/admin/payments" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Review Payment</a>
        </div>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `Action Required: Pending Payment of ${amountStr} via ${gatewayName}`,
      html,
    });
  } catch (error) {
    console.error(`[email] Failed to send admin custom payment email for ${transactionId}:`, error);
  }
}
