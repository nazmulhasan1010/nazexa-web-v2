import { PrismaClient } from '@prisma/client';

const premiumTemplates = [
  {
    "name": "Welcome / Thank You",
    "key": "marketing.welcome",
    "subject": "Welcome to Nazexa - Let's get started!",
    "contentHtml": "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 1px solid #eaeaea;'><div style='text-align: center; margin-bottom: 30px;'><h1 style='color: #0f172a; margin: 0; font-size: 24px;'>Welcome to Nazexa!</h1></div><p style='color: #334155; font-size: 16px; line-height: 1.6;'>Hi there,</p><p style='color: #334155; font-size: 16px; line-height: 1.6;'>Thank you for joining our community! We are thrilled to have you on board. Here at Nazexa, we're building the future of software development, and you're now a part of it.</p><div style='text-align: center; margin: 40px 0;'><a href='https://nazexa.com/dashboard' style='background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;'>Go to Dashboard</a></div><p style='color: #334155; font-size: 16px; line-height: 1.6;'>If you have any questions, feel free to reply to this email. We're always here to help.</p><hr style='border: none; border-top: 1px solid #eaeaea; margin: 40px 0;' /><div style='text-align: center; color: #94a3b8; font-size: 14px;'><p>&copy; 2026 Nazexa Inc. All rights reserved.</p></div></div>"
  },
  {
    "name": "Newsletter (Monthly)",
    "key": "marketing.newsletter",
    "subject": "Nazexa Monthly Digest: What's New",
    "contentHtml": "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fafafa; border-radius: 8px;'><div style='background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #eaeaea;'><h1 style='color: #0f172a; font-size: 22px; margin-top: 0;'>Monthly Digest</h1><p style='color: #475569; line-height: 1.6;'>Hello,</p><p style='color: #475569; line-height: 1.6;'>Here is a roundup of the latest news, updates, and resources from the Nazexa team over the past month.</p><div style='background-color: #f1f5f9; padding: 20px; border-radius: 6px; margin: 25px 0;'><h3 style='margin-top: 0; color: #0f172a;'>🚀 Product Updates</h3><p style='color: #475569; margin-bottom: 0;'>We've launched several new features to help you build faster. Check out our changelog for the full details.</p></div><div style='text-align: center; margin-top: 30px;'><a href='https://nazexa.com/blog' style='background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;'>Read the Blog</a></div></div><p style='text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;'>You are receiving this because you subscribed to our newsletter.</p></div>"
  },
  {
    "name": "Product Announcement",
    "key": "marketing.announcement",
    "subject": "Introducing our newest feature: Nazexa AI",
    "contentHtml": "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;'><h1 style='color: #0f172a; text-align: center;'>Meet Nazexa AI 🤖</h1><p style='color: #334155; line-height: 1.6;'>Hi,</p><p style='color: #334155; line-height: 1.6;'>We're incredibly excited to announce the launch of our newest product feature. It's designed to streamline your workflow and save you hours every week.</p><img src='https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop' alt='AI Feature' style='width: 100%; border-radius: 8px; margin: 20px 0;' /><p style='color: #334155; line-height: 1.6;'>Log in today to explore what's new and see how it can transform your projects.</p><div style='text-align: center; margin: 30px 0;'><a href='https://nazexa.com' style='background-color: #0f172a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;'>Try it now</a></div></div>"
  },
  {
    "name": "New Service Announcement",
    "key": "marketing.service",
    "subject": "We now offer Managed Cloud Hosting",
    "contentHtml": "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><h2 style='color: #1e293b;'>Level up your infrastructure</h2><p style='color: #475569; line-height: 1.5;'>Hello,</p><p style='color: #475569; line-height: 1.5;'>You asked, and we listened. We're thrilled to introduce our new Managed Cloud Hosting service, available now for all premium users.</p><ul style='color: #475569; line-height: 1.5; padding-left: 20px;'><li>Zero-downtime deployments</li><li>Automated database backups</li><li>Global edge caching</li></ul><p style='color: #475569; line-height: 1.5;'>Upgrade your plan today to gain access.</p></div>"
  },
  {
    "name": "Special Offer",
    "key": "marketing.offer",
    "subject": "Special Offer: 50% off for the next 48 hours",
    "contentHtml": "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; border-radius: 12px; text-align: center;'><h1 style='margin-top: 0;'>Flash Sale! ⚡</h1><p style='font-size: 18px; line-height: 1.6; opacity: 0.9;'>Hi there, for the next 48 hours only, we're offering a massive 50% discount on all annual plans.</p><div style='background-color: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 30px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;'>USE CODE: FLASH50</div><a href='https://nazexa.com/pricing' style='background-color: #3b82f6; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>Claim Discount</a></div>"
  },
  {
    "name": "Promotional Campaign",
    "key": "marketing.promo",
    "subject": "Boost your productivity with Nazexa Pro",
    "contentHtml": "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'><h2 style='color: #334155;'>Take your team to the next level</h2><p style='color: #475569;'>Nazexa Pro provides advanced collaboration tools, unlimited projects, and priority support.</p><p style='color: #475569;'>Upgrade now and see the difference.</p><a href='https://nazexa.com/pro' style='display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;'>View Pro Features</a></div>"
  },
  {
    "name": "Company Update",
    "key": "marketing.update",
    "subject": "A message from our CEO",
    "contentHtml": "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><p style='color: #334155; line-height: 1.6;'>Hi,</p><p style='color: #334155; line-height: 1.6;'>As we close out another fantastic quarter, I wanted to personally reach out and thank you for your continued support.</p><p style='color: #334155; line-height: 1.6;'>We've achieved significant milestones recently, and we're excited for what the future holds...</p><p style='color: #334155; line-height: 1.6;'>Best regards,<br/>The CEO</p></div>"
  },
  {
    "name": "New Blog / Article",
    "key": "marketing.blog",
    "subject": "New Post: The Future of Web Development",
    "contentHtml": "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><h2 style='color: #0f172a;'>Fresh on the Nazexa Blog</h2><p style='color: #475569; line-height: 1.6;'>We just published a new comprehensive guide on modern web architectures. If you're building scalable applications, this is a must-read.</p><a href='https://nazexa.com/blog/future' style='color: #2563eb; font-weight: bold; text-decoration: none;'>Read the full article &rarr;</a></div>"
  },
  {
    "name": "Event Announcement",
    "key": "marketing.event",
    "subject": "Join us at Nazexa Conf 2026!",
    "contentHtml": "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; border: 1px solid #eaeaea; border-radius: 12px;'><h1 style='color: #0f172a;'>Nazexa Conf 2026</h1><p style='color: #475569;'>The premier developer conference is back. Reserve your spot today!</p><div style='margin: 30px 0;'><a href='https://nazexa.com/conf' style='background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;'>Register Now</a></div></div>"
  },
  {
    "name": "Webinar Invitation",
    "key": "marketing.webinar",
    "subject": "Free Webinar: Mastering Nazexa Database",
    "contentHtml": "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><h2 style='color: #1e293b;'>Join our upcoming technical webinar</h2><p style='color: #475569;'>Learn advanced tips and tricks from our engineering team.</p><p style='color: #475569;'><strong>Date:</strong> Thursday, Oct 15th<br/><strong>Time:</strong> 10:00 AM PST</p><a href='https://nazexa.com/webinar' style='display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;'>Save Your Seat</a></div>"
  },
  {
    "name": "Maintenance Notification",
    "key": "marketing.maintenance",
    "subject": "Scheduled System Maintenance",
    "contentHtml": "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-left: 4px solid #f59e0b; background-color: #fffbeb;'><h3 style='color: #b45309; margin-top: 0;'>Maintenance Notice</h3><p style='color: #92400e;'>Please be advised that we will be performing scheduled maintenance on our servers on Sunday at 2:00 AM UTC. Expect up to 15 minutes of downtime.</p></div>"
  },
  {
    "name": "Important Notice",
    "key": "marketing.notice",
    "subject": "Important updates to our Terms of Service",
    "contentHtml": "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><h2 style='color: #0f172a;'>Terms of Service Update</h2><p style='color: #475569;'>We have updated our Terms of Service and Privacy Policy to better reflect our new features and comply with recent regulations. Please review the changes.</p><a href='https://nazexa.com/legal' style='color: #2563eb; text-decoration: none;'>View updated terms</a></div>"
  },
  {
    "name": "Customer Appreciation",
    "key": "marketing.appreciation",
    "subject": "A small gift to say thank you 🎁",
    "contentHtml": "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; text-align: center;'><h2 style='color: #0f172a;'>You're amazing!</h2><p style='color: #475569;'>As a token of our appreciation for being a loyal customer, we're giving you a free month of our premium tier.</p><a href='https://nazexa.com/redeem' style='display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 6px;'>Redeem Gift</a></div>"
  },
  {
    "name": "Holiday / Seasonal Greeting",
    "key": "marketing.holiday",
    "subject": "Happy Holidays from the Nazexa Team!",
    "contentHtml": "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; text-align: center; background-color: #f8fafc; border-radius: 12px;'><h1 style='color: #1e293b;'>Happy Holidays! ❄️</h1><p style='color: #475569; line-height: 1.6;'>Wishing you and yours a joyful holiday season and a prosperous New Year. Thank you for making this year our best one yet.</p></div>"
  },
  {
    "name": "Re-engagement / We Miss You",
    "key": "marketing.reengagement",
    "subject": "We miss you! Here's what's new",
    "contentHtml": "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><h2 style='color: #0f172a;'>It's been a while</h2><p style='color: #475569; line-height: 1.6;'>We noticed you haven't logged in recently. A lot has changed since you were last here!</p><ul style='color: #475569;'><li>New Dark Mode UI</li><li>Faster API responses</li><li>New integrations</li></ul><a href='https://nazexa.com/login' style='display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #0f172a; color: white; text-decoration: none; border-radius: 5px;'>See What's New</a></div>"
  }
];

export async function seedMailTemplates(prisma: PrismaClient) {
  console.log('Seeding SystemEmailTemplates...');
  
  const admin = await prisma.adminUser.findFirst({
    where: { email: 'admin@nazexa.com' }
  });

  if (!admin) {
    console.error('Admin user not found. Cannot seed templates.');
    return;
  }

  for (const template of premiumTemplates) {
    const designJson = JSON.stringify({
      version: 2,
      settings: {
        width: 600,
        backgroundColor: "#f4f4f5",
        containerColor: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
        textColor: "#09090b",
        primaryColor: "#2563eb",
      },
      sections: [
        {
          id: "sec_" + Math.random().toString(36).substr(2, 9),
          layout: "100",
          columns: [
            {
              id: "col_" + Math.random().toString(36).substr(2, 9),
              width: "100%",
              blocks: [
                {
                  id: "blk_" + Math.random().toString(36).substr(2, 9),
                  type: "richtext",
                  content: { html: template.contentHtml },
                  typography: { textAlign: "left" },
                  style: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }
                }
              ],
              style: {}
            }
          ],
          style: { paddingTop: 20, paddingBottom: 20, paddingLeft: 0, paddingRight: 0 }
        }
      ]
    });

    const existing = await prisma.systemEmailTemplate.findUnique({
      where: { key: template.key }
    });

    if (existing) {
      await prisma.systemEmailTemplate.update({
        where: { id: existing.id },
        data: {
          name: template.name,
          subject: template.subject,
          contentHtml: template.contentHtml,
          designJson: designJson,
          status: 'published'
        }
      });
    } else {
      await prisma.systemEmailTemplate.create({
        data: {
          name: template.name,
          key: template.key,
          category: 'Marketing',
          subject: template.subject,
          contentHtml: template.contentHtml,
          designJson: designJson,
          status: 'published',
          createdBy: admin.id,
          updatedBy: admin.id
        }
      });
    }
  }

  console.log('SystemEmailTemplates seeded successfully.');
}
