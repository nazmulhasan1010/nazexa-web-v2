'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveConfigAction, getConfigMapAction } from '../actions';
import { toast } from 'sonner';

export default function ContactSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [configs, setConfigs] = useState<Record<string, any>>({
    'contact.companyName': '',
    'contact.supportEmail': '',
    'contact.phone': '',
    'contact.address': '',
    'contact.whatsapp': '',
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
    const payload = keys.map(key => ({ key, category: 'Contact', value: configs[key] }));
    const result = await saveConfigAction(payload);
    if (result.success) toast.success('Saved successfully.');
    else toast.error(result.error || 'Failed to save.');
    setLoading(false);
  };

  if (fetching) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Contact Settings</h1>
        <p className="text-muted-foreground mt-2">Manage public contact information.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Contact Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Company Name</Label><Input value={configs['contact.companyName'] || ''} onChange={e => handleChange('contact.companyName', e.target.value)} /></div>
            <div className="space-y-2"><Label>Support Email</Label><Input value={configs['contact.supportEmail'] || ''} onChange={e => handleChange('contact.supportEmail', e.target.value)} /></div>
            <div className="space-y-2"><Label>Phone Number</Label><Input value={configs['contact.phone'] || ''} onChange={e => handleChange('contact.phone', e.target.value)} /></div>
            <div className="space-y-2"><Label>WhatsApp</Label><Input value={configs['contact.whatsapp'] || ''} onChange={e => handleChange('contact.whatsapp', e.target.value)} /></div>
            <div className="space-y-2 col-span-2"><Label>Address</Label><Input value={configs['contact.address'] || ''} onChange={e => handleChange('contact.address', e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button></div>
    </div>
  );
}
