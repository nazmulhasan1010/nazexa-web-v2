'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { saveConfigAction, getConfigMapAction } from '../actions';
import { toast } from 'sonner';

export default function CaptchaSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [configs, setConfigs] = useState<Record<string, any>>({
    'captcha.turnstile.enabled': false,
    'captcha.turnstile.siteKey': '',
    'captcha.turnstile.secretKey': '',
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
      { key: 'captcha.turnstile.enabled', category: 'CAPTCHA', value: configs['captcha.turnstile.enabled'], valueType: 'boolean' },
      { key: 'captcha.turnstile.siteKey', category: 'CAPTCHA', value: configs['captcha.turnstile.siteKey'], isPublic: true },
      { key: 'captcha.turnstile.secretKey', category: 'CAPTCHA', value: configs['captcha.turnstile.secretKey'], isSecret: true },
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
        <h1 className="text-3xl font-bold">CAPTCHA Settings</h1>
        <p className="text-muted-foreground mt-2">Cloudflare Turnstile and spam prevention.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Cloudflare Turnstile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 pb-4">
            <Switch checked={configs['captcha.turnstile.enabled'] === true} onCheckedChange={v => handleChange('captcha.turnstile.enabled', v)} />
            <Label>Enable Turnstile</Label>
          </div>
          <div className="space-y-2"><Label>Site Key</Label><Input value={configs['captcha.turnstile.siteKey'] || ''} onChange={e => handleChange('captcha.turnstile.siteKey', e.target.value)} /></div>
          <div className="space-y-2"><Label>Secret Key</Label><Input type="password" value={configs['captcha.turnstile.secretKey'] || ''} onChange={e => handleChange('captcha.turnstile.secretKey', e.target.value)} placeholder="••••••••••••••••••" /></div>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button></div>
    </div>
  );
}
