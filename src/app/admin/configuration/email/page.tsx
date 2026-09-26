'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { saveConfigAction, getConfigMapAction } from '../actions';
import { toast } from 'sonner';

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [configs, setConfigs] = useState<Record<string, any>>({
    'smtp.host': '',
    'smtp.port': '587',
    'smtp.user': '',
    'smtp.pass': '',
    'smtp.secure': false,
    'email.from.name': 'Nazexa',
    'email.from.address': 'no-reply@nazexa.com',
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

  const handleChange = (key: string, value: any) => {
    setConfigs(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    const payload = [
      { key: 'smtp.host', category: 'Email', value: configs['smtp.host'] },
      { key: 'smtp.port', category: 'Email', value: configs['smtp.port'], valueType: 'number' },
      { key: 'smtp.user', category: 'Email', value: configs['smtp.user'] },
      { key: 'smtp.pass', category: 'Email', value: configs['smtp.pass'], isSecret: true },
      { key: 'smtp.secure', category: 'Email', value: configs['smtp.secure'], valueType: 'boolean' },
      { key: 'email.from.name', category: 'Email', value: configs['email.from.name'] },
      { key: 'email.from.address', category: 'Email', value: configs['email.from.address'] },
    ];

    const result = await saveConfigAction(payload);
    if (result.success) {
      toast.success('Email configuration saved successfully.');
    } else {
      toast.error(result.error || 'Failed to save configuration.');
    }
    setLoading(false);
  };

  if (fetching) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure SMTP servers, sender details, and email delivery behaviors.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP Host</Label>
              <Input 
                value={configs['smtp.host']} 
                onChange={e => handleChange('smtp.host', e.target.value)} 
                placeholder="smtp.gmail.com" 
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Port</Label>
              <Input 
                type="number"
                value={configs['smtp.port']} 
                onChange={e => handleChange('smtp.port', e.target.value)} 
                placeholder="587" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP Username</Label>
              <Input 
                value={configs['smtp.user']} 
                onChange={e => handleChange('smtp.user', e.target.value)} 
                placeholder="user@example.com" 
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Password</Label>
              <Input 
                type="password"
                value={configs['smtp.pass']} 
                onChange={e => handleChange('smtp.pass', e.target.value)} 
                placeholder="••••••••" 
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              checked={configs['smtp.secure']} 
              onCheckedChange={v => handleChange('smtp.secure', v)} 
            />
            <Label>Use TLS/SSL Encryption</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sender Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Name</Label>
              <Input 
                value={configs['email.from.name']} 
                onChange={e => handleChange('email.from.name', e.target.value)} 
                placeholder="Nazexa Support" 
              />
            </div>
            <div className="space-y-2">
              <Label>From Email Address</Label>
              <Input 
                type="email"
                value={configs['email.from.address']} 
                onChange={e => handleChange('email.from.address', e.target.value)} 
                placeholder="no-reply@nazexa.com" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => toast('Test email queued.')}>Test Connection</Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
}
