"use client";

import { useState } from "react";
import { User, Shield, Key, Bell, CreditCard } from "lucide-react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { SecurityForm } from "@/components/profile/SecurityForm";
import { UsageAndBilling } from "@/components/profile/UsageAndBilling";
import { Section } from "@/components/site/PageShell";

export function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "apikeys" | "notifications" | "billing"
  >("profile");

  return (
    <Section className="relative z-10 max-w-5xl pt-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="sticky top-28 space-y-1">
            <div className="mb-8 px-3">
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Manage your account settings.
              </p>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === "profile"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <User className="h-4 w-4" />
                Public Profile
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === "security"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Shield className="h-4 w-4" />
                Security
              </button>
              <button
                onClick={() => setActiveTab("apikeys")}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === "apikeys"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Key className="h-4 w-4" />
                API Keys
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === "notifications"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Bell className="h-4 w-4" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab("billing")}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === "billing"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                Usage & Billing
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="surface-card rounded-2xl overflow-hidden border border-border/50 shadow-sm backdrop-blur-xl">
            {activeTab === "profile" && <ProfileForm />}

            {activeTab === "security" && (
              <div className="p-8">
                <div className="h-32 w-full bg-linear-to-r from-primary/30 via-primary/10 to-transparent relative -mt-8 -mx-8 mb-8">
                  <div className="absolute inset-0 bg-linear-to-b from-transparent to-background/80" />
                  <div className="absolute bottom-6 left-8 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 backdrop-blur-md">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        Security
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Manage passwords and authentication methods
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <SecurityForm />
                </div>
              </div>
            )}

            {activeTab === "apikeys" && (
              <div className="p-8">
                <div className="h-32 w-full bg-linear-to-r from-primary/30 via-primary/10 to-transparent relative -mt-8 -mx-8 mb-8">
                  <div className="absolute inset-0 bg-linear-to-b from-transparent to-background/80" />
                  <div className="absolute bottom-6 left-8 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 backdrop-blur-md">
                      <Key className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        API Keys
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Manage your developer access tokens
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Key className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium">Developer API Keys</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    API Key generation module is coming soon. You'll be able to
                    issue tokens for programmatic access to the Nazexa API.
                  </p>
                </div>
              </div>
            )}

              {activeTab === "notifications" && (
              <div className="p-8">
                <div className="h-32 w-full bg-linear-to-r from-primary/30 via-primary/10 to-transparent relative -mt-8 -mx-8 mb-8">
                  <div className="absolute inset-0 bg-linear-to-b from-transparent to-background/80" />
                  <div className="absolute bottom-6 left-8 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 backdrop-blur-md">
                      <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        Notifications
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Configure email and push alerts
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium">
                    Notification Preferences
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    Notification settings module is coming soon. Customize what
                    emails and alerts you want to receive.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <UsageAndBilling />
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
