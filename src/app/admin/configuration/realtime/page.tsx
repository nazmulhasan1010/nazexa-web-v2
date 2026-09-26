'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { saveConfigAction, getConfigMapAction } from '../actions';
import { toast } from 'sonner';

export default function RealtimeSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [configs, setConfigs] = useState<Record<string, any>>({
    'socket.enabled': false,
    'socket.url': '',
    'socket.projectId': '',
    'socket.secretKey': '',
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
      { key: 'socket.enabled', category: 'Realtime', value: configs['socket.enabled'], valueType: 'boolean' },
      { key: 'socket.url', category: 'Realtime', value: configs['socket.url'], isPublic: true },
      { key: 'socket.projectId', category: 'Realtime', value: configs['socket.projectId'], isPublic: true },
      { key: 'socket.secretKey', category: 'Realtime', value: configs['socket.secretKey'], isSecret: true },
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
        <h1 className="text-3xl font-bold">Realtime / Socket</h1>
        <p className="text-muted-foreground mt-2">Manage the Nazexa Socket integration.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Socket Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 pb-4">
            <Switch checked={configs['socket.enabled'] === true} onCheckedChange={v => handleChange('socket.enabled', v)} />
            <Label>Enable Realtime Features</Label>
          </div>
          <div className="space-y-2"><Label>Socket URL</Label><Input value={configs['socket.url'] || ''} onChange={e => handleChange('socket.url', e.target.value)} placeholder="https://socket.nazexa.com" /></div>
          <div className="space-y-2"><Label>Project ID</Label><Input value={configs['socket.projectId'] || ''} onChange={e => handleChange('socket.projectId', e.target.value)} /></div>
          <div className="space-y-2"><Label>Secret Key</Label><Input type="password" value={configs['socket.secretKey'] || ''} onChange={e => handleChange('socket.secretKey', e.target.value)} placeholder="••••••••••••••••••" /></div>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button></div>
    </div>
  );
}
