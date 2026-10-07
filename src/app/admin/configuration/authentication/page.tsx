'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { saveConfigAction, getConfigMapAction } from '../actions';
import { toast } from 'sonner';

export default function AuthenticationSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [configs, setConfigs] = useState<Record<string, any>>({
    'auth.emailPasswordEnabled': true,
    'auth.registrationEnabled': true,
    'auth.emailVerificationRequired': false,
    'auth.passwordResetEnabled': true,
    'auth.ssoEnabled': true,
  });

  const keys = Object.keys(configs);

  useEffect(() => {
    getConfigMapAction(keys).then(res => {
      if (res.success && res.data) {
        setConfigs(prev => ({ ...prev, ...res.data }));
      }
      setFetching(false);
    });
  }, []);

  const handleChange = (key: string, value: any) => setConfigs(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setLoading(true);
    const payload = keys.map(key => ({ key, category: 'Authentication', value: configs[key], valueType: 'boolean' }));
    const result = await saveConfigAction(payload);
    if (result.success) toast.success('Saved successfully.');
    else toast.error(result.error || 'Failed to save.');
    setLoading(false);
  };

  if (fetching) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Authentication Settings</h1>
        <p className="text-muted-foreground mt-2">Core login, registration, and session policies across the Nazexa ecosystem.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Core Policies</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between space-x-4">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Enable Email/Password Login</Label>
              <p className="text-sm text-muted-foreground">Allow users to log in using their email address and password across all applications.</p>
            </div>
            <Switch checked={configs['auth.emailPasswordEnabled'] === true} onCheckedChange={v => handleChange('auth.emailPasswordEnabled', v)} />
          </div>

          <div className="flex items-start justify-between space-x-4">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Allow Public Registration</Label>
              <p className="text-sm text-muted-foreground">Allow new visitors to register for accounts. When disabled, public registration is blocked.</p>
            </div>
            <Switch checked={configs['auth.registrationEnabled'] === true} onCheckedChange={v => handleChange('auth.registrationEnabled', v)} />
          </div>

          <div className="flex items-start justify-between space-x-4">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">Require newly registered users to verify their email before accessing protected resources.</p>
            </div>
            <Switch checked={configs['auth.emailVerificationRequired'] === true} onCheckedChange={v => handleChange('auth.emailVerificationRequired', v)} />
          </div>

          <div className="flex items-start justify-between space-x-4">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Enable Password Reset</Label>
              <p className="text-sm text-muted-foreground">Allow users to request password reset emails and reset forgotten passwords.</p>
            </div>
            <Switch checked={configs['auth.passwordResetEnabled'] === true} onCheckedChange={v => handleChange('auth.passwordResetEnabled', v)} />
          </div>

          <div className="flex items-start justify-between space-x-4 border-t pt-4">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Enable Central Authentication / Nazexa SSO</Label>
              <p className="text-sm text-muted-foreground">Allow cross-app Single Sign-On and &quot;Continue with Nazexa SSO&quot; across all Nazexa projects.</p>
            </div>
            <Switch checked={configs['auth.ssoEnabled'] === true} onCheckedChange={v => handleChange('auth.ssoEnabled', v)} />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button></div>
    </div>
  );
}
