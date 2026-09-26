'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { saveConfigAction, getConfigMapAction } from '../actions';
import { toast } from 'sonner';

export default function SecuritySettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [configs, setConfigs] = useState<Record<string, any>>({
    'security.sessionSecret': '',
    'security.webhookSecret': '',
    'security.rateLimit.enabled': false,
    'security.rateLimit.maxRequests': '100',
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
    const payload = [
      { key: 'security.sessionSecret', category: 'Security', value: configs['security.sessionSecret'], isSecret: true },
      { key: 'security.webhookSecret', category: 'Security', value: configs['security.webhookSecret'], isSecret: true },
      { key: 'security.rateLimit.enabled', category: 'Security', value: configs['security.rateLimit.enabled'], valueType: 'boolean' },
      { key: 'security.rateLimit.maxRequests', category: 'Security', value: configs['security.rateLimit.maxRequests'], valueType: 'number' },
    ];
    const result = await saveConfigAction(payload);
    if (result.success) toast.success('Saved successfully.');
    else toast.error(result.error || 'Failed to save.');
    setLoading(false);
  };

  if (fetching) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground mt-2">Internal secrets and security policies.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Internal Secrets</CardTitle><CardDescription>These secrets are encrypted in the database.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Session Secret</Label><Input type="password" value={configs['security.sessionSecret'] || ''} onChange={e => handleChange('security.sessionSecret', e.target.value)} placeholder="••••••••••••••••••" /></div>
          <div className="space-y-2"><Label>Webhook Secret</Label><Input type="password" value={configs['security.webhookSecret'] || ''} onChange={e => handleChange('security.webhookSecret', e.target.value)} placeholder="••••••••••••••••••" /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Rate Limiting</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 pb-4">
            <Switch checked={configs['security.rateLimit.enabled'] === true} onCheckedChange={v => handleChange('security.rateLimit.enabled', v)} />
            <Label>Enable Rate Limiting</Label>
          </div>
          <div className="space-y-2"><Label>Max Requests per Minute</Label><Input type="number" value={configs['security.rateLimit.maxRequests'] || ''} onChange={e => handleChange('security.rateLimit.maxRequests', e.target.value)} /></div>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button></div>
    </div>
  );
}
