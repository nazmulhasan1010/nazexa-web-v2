'use client';

import { useState } from 'react';
import { User, Shield, Bell, CreditCard } from 'lucide-react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { SecurityForm } from '@/components/profile/SecurityForm';
import { UsageAndBilling } from '@/components/profile/UsageAndBilling';
import { Section } from '@/components/site/PageShell';

export function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'security' | 'notifications' | 'billing'
  >('profile');

  return (
    <Section className="relative z-10 max-w-5xl pt-10">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar */}
        <div className="w-full shrink-0 md:w-64">
          <div className="sticky top-28 space-y-1">
            <div className="mb-8 px-3">
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-2 text-sm">Manage your account settings.</p>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <User className="h-4 w-4" />
                Public Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === 'security'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Shield className="h-4 w-4" />
                Security
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Bell className="h-4 w-4" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === 'billing'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                Usage & Billing
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <div className="surface-card border-border/50 overflow-hidden rounded-2xl border shadow-sm backdrop-blur-xl">
            {activeTab === 'profile' && <ProfileForm />}

            {activeTab === 'security' && <SecurityForm />}



            {activeTab === 'notifications' && (
              <div className="p-8">
                <div className="from-primary/30 via-primary/10 relative -mx-8 -mt-8 mb-8 h-32 w-full bg-linear-to-r to-transparent">
                  <div className="to-background/80 absolute inset-0 bg-linear-to-b from-transparent" />
                  <div className="absolute bottom-6 left-8 flex items-center gap-4">
                    <div className="bg-primary/10 border-primary/20 flex h-12 w-12 items-center justify-center rounded-xl border backdrop-blur-md">
                      <Bell className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
                      <p className="text-muted-foreground text-sm">
                        Configure email and push alerts
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Bell className="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
                  <h3 className="text-lg font-medium">Notification Preferences</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                    Notification settings module is coming soon. Customize what emails and alerts
                    you want to receive.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'billing' && <UsageAndBilling />}
          </div>
        </div>
      </div>
    </Section>
  );
}
