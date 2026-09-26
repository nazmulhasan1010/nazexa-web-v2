'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveConfigAction, getConfigMapAction } from '../actions';
import { toast } from 'sonner';

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [configs, setConfigs] = useState<Record<string, any>>({
    'general.siteName': '',
    'general.siteDescription': '',
    'general.supportEmail': '',
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
      { key: 'general.siteName', category: 'General', value: configs['general.siteName'] },
      { key: 'general.siteDescription', category: 'General', value: configs['general.siteDescription'] },
      { key: 'general.supportEmail', category: 'General', value: configs['general.supportEmail'] },
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
        <h1 className="text-3xl font-bold">General Settings</h1>
        <p className="text-muted-foreground mt-2">Manage system-wide defaults and branding.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Site Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Site Name</Label>
            <Input value={configs['general.siteName'] || ''} onChange={e => handleChange('general.siteName', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Site Description</Label>
            <Input value={configs['general.siteDescription'] || ''} onChange={e => handleChange('general.siteDescription', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Global Support Email</Label>
            <Input type="email" value={configs['general.supportEmail'] || ''} onChange={e => handleChange('general.supportEmail', e.target.value)} />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button></div>
    </div>
  );
}
