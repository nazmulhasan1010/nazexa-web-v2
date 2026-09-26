import React from 'react';
import { Mail, Phone, Shield, Radio, KeyRound, Smartphone, LayoutDashboard, History } from 'lucide-react';
import { ConfigCard } from '@/components/admin/configuration/ConfigCard';

export const metadata = {
  title: 'Configuration Center | Nazexa Admin',
};

export default async function ConfigurationDashboardPage() {
  // In a real implementation, we would query the DB for the latest status of each config.
  // For now, we stub this out for the dashboard view.
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuration Center</h1>
        <p className="text-muted-foreground mt-2">
          Manage system configurations, integrations, and security settings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ConfigCard
          title="General Settings"
          description="System-wide defaults, branding, and core setup."
          status="active"
          href="/admin/configuration/general"
          icon={LayoutDashboard}
        />
        
        <ConfigCard
          title="Contact Settings"
          description="Public contact info, social links, and business hours."
          status="active"
          href="/admin/configuration/contact"
          icon={Phone}
        />
        
        <ConfigCard
          title="Email Settings"
          description="SMTP configuration and email sending behavior."
          status="warning"
          statusMessage="SMTP partially configured"
          href="/admin/configuration/email"
          icon={Mail}
        />
        
        <ConfigCard
          title="Authentication"
          description="Core login, registration, and session policies."
          status="active"
          href="/admin/configuration/authentication"
          icon={KeyRound}
        />

        <ConfigCard
          title="Security Settings"
          description="Internal secrets, rate limits, and CSRF settings."
          status="warning"
          statusMessage="2 require attention"
          href="/admin/configuration/security"
          icon={Shield}
        />
        
        <ConfigCard
          title="Realtime / Socket"
          description="Nazexa Socket Platform integration."
          status="active"
          href="/admin/configuration/realtime"
          icon={Radio}
        />
        
        <ConfigCard
          title="CAPTCHA"
          description="Cloudflare Turnstile and spam prevention."
          status="disabled"
          statusMessage="Not configured"
          href="/admin/configuration/captcha"
          icon={Smartphone}
        />

        <ConfigCard
          title="Social Login"
          description="Google, GitHub, and other OAuth providers."
          status="active"
          statusMessage="2 providers active"
          href="/admin/configuration/social"
          icon={KeyRound}
        />

        <ConfigCard
          title="Configuration Logs"
          description="Audit trail of all system configuration changes."
          status="active"
          statusMessage="Monitoring active"
          href="/admin/configuration/logs"
          icon={History}
        />
      </div>
    </div>
  );
}
