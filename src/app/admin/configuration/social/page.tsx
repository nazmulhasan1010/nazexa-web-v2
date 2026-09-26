'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { saveConfigAction, getConfigMapAction } from '../actions';
import { toast } from 'sonner';

export default function SocialLoginSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [configs, setConfigs] = useState<Record<string, any>>({
    'oauth.google.enabled': false,
    'oauth.google.clientId': '',
    'oauth.google.clientSecret': '',
    'oauth.github.enabled': false,
    'oauth.github.clientId': '',
    'oauth.github.clientSecret': '',
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
      { key: 'oauth.google.enabled', category: 'OAuth', value: configs['oauth.google.enabled'], valueType: 'boolean' },
      { key: 'oauth.google.clientId', category: 'OAuth', value: configs['oauth.google.clientId'] },
      { key: 'oauth.google.clientSecret', category: 'OAuth', value: configs['oauth.google.clientSecret'], isSecret: true },
      { key: 'oauth.github.enabled', category: 'OAuth', value: configs['oauth.github.enabled'], valueType: 'boolean' },
      { key: 'oauth.github.clientId', category: 'OAuth', value: configs['oauth.github.clientId'] },
      { key: 'oauth.github.clientSecret', category: 'OAuth', value: configs['oauth.github.clientSecret'], isSecret: true },
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
        <h1 className="text-3xl font-bold">Social Login</h1>
        <p className="text-muted-foreground mt-2">Manage Google, GitHub, and other OAuth providers.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Google OAuth</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 pb-4">
            <Switch checked={configs['oauth.google.enabled'] === true} onCheckedChange={v => handleChange('oauth.google.enabled', v)} />
            <Label>Enable Google Login</Label>
          </div>
          <div className="space-y-2"><Label>Client ID</Label><Input value={configs['oauth.google.clientId'] || ''} onChange={e => handleChange('oauth.google.clientId', e.target.value)} /></div>
          <div className="space-y-2"><Label>Client Secret</Label><Input type="password" value={configs['oauth.google.clientSecret'] || ''} onChange={e => handleChange('oauth.google.clientSecret', e.target.value)} placeholder="••••••••••••••••••" /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>GitHub OAuth</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 pb-4">
            <Switch checked={configs['oauth.github.enabled'] === true} onCheckedChange={v => handleChange('oauth.github.enabled', v)} />
            <Label>Enable GitHub Login</Label>
          </div>
          <div className="space-y-2"><Label>Client ID</Label><Input value={configs['oauth.github.clientId'] || ''} onChange={e => handleChange('oauth.github.clientId', e.target.value)} /></div>
          <div className="space-y-2"><Label>Client Secret</Label><Input type="password" value={configs['oauth.github.clientSecret'] || ''} onChange={e => handleChange('oauth.github.clientSecret', e.target.value)} placeholder="••••••••••••••••••" /></div>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button></div>
    </div>
  );
}
