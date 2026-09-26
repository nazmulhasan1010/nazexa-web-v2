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
    'auth.emailVerificationRequired': false,
    'auth.registrationEnabled': true,
    'auth.passwordResetEnabled': true,
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
        <p className="text-muted-foreground mt-2">Core login, registration, and session policies.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Core Policies</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2"><Switch checked={configs['auth.emailPasswordEnabled'] === true} onCheckedChange={v => handleChange('auth.emailPasswordEnabled', v)} /><Label>Enable Email/Password Login</Label></div>
          <div className="flex items-center space-x-2"><Switch checked={configs['auth.registrationEnabled'] === true} onCheckedChange={v => handleChange('auth.registrationEnabled', v)} /><Label>Allow Public Registration</Label></div>
          <div className="flex items-center space-x-2"><Switch checked={configs['auth.emailVerificationRequired'] === true} onCheckedChange={v => handleChange('auth.emailVerificationRequired', v)} /><Label>Require Email Verification</Label></div>
          <div className="flex items-center space-x-2"><Switch checked={configs['auth.passwordResetEnabled'] === true} onCheckedChange={v => handleChange('auth.passwordResetEnabled', v)} /><Label>Enable Password Reset</Label></div>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button></div>
    </div>
  );
}
