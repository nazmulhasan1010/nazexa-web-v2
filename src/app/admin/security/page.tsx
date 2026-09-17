'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updateSecuritySettings } from './actions';

export default function SecurityAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [siteKey, setSiteKey] = useState('');
  const [secretKey, setSecretKey] = useState('');

  useEffect(() => {
    fetch('/api/auth/turnstile/config')
      .then(res => res.json())
      .then(data => {
        setEnabled(data.enabled);
        setSiteKey(data.siteKey || '');
        // Secret key is not exposed via GET config endpoint, we just leave it blank for security unless we create a dedicated GET endpoint for admins. For simplicity here, we'll let user input it or just update it.
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await updateSecuritySettings({ enabled, siteKey, secretKey });
    if (res.success) {
      toast.success('Security settings updated');
    } else {
      toast.error('Failed to update settings');
    }
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Security Settings</h2>
        <p className="text-muted-foreground">Manage Cloudflare Turnstile and other security configurations.</p>
      </div>

      <div className="space-y-4 border p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Cloudflare Turnstile</Label>
            <p className="text-sm text-muted-foreground">Protect login forms across all platforms.</p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Site Key</Label>
              <Input value={siteKey} onChange={(e) => setSiteKey(e.target.value)} placeholder="1x00000..." />
            </div>
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <Input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder="Leave blank to keep existing secret" />
            </div>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full mt-4">
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
