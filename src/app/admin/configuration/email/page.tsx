'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { saveConfigAction, getConfigMapAction, testEmailConnectionAction } from '../actions';
import { toast } from 'sonner';
import {
  Mail,
  Server,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordConfigured, setIsPasswordConfigured] = useState(false);

  // Test dialog state
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [sendTestMail, setSendTestMail] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

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

  const loadConfigs = async () => {
    setFetching(true);
    try {
      const res = await getConfigMapAction(keys);
      if (res.success && res.data) {
        setConfigs((prev) => ({
          'smtp.host': res.data['smtp.host'] ?? prev['smtp.host'] ?? '',
          'smtp.port': res.data['smtp.port'] != null ? String(res.data['smtp.port']) : '587',
          'smtp.user': res.data['smtp.user'] ?? prev['smtp.user'] ?? '',
          'smtp.pass': '', // Keep empty in form state to prevent accidental exposure/overwrite
          'smtp.secure': res.data['smtp.secure'] === true || res.data['smtp.secure'] === 'true',
          'email.from.name': res.data['email.from.name'] ?? prev['email.from.name'] ?? 'Nazexa',
          'email.from.address': res.data['email.from.address'] ?? prev['email.from.address'] ?? 'no-reply@nazexa.com',
        }));

        const hasPass = Boolean(res.meta?.['smtp.pass']?.isConfigured || res.data['smtp.pass']);
        setIsPasswordConfigured(hasPass);
      }
    } catch (err: any) {
      toast.error('Failed to load email configurations.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleChange = (key: string, value: any) => {
    setConfigs((prev) => {
      const next = { ...prev, [key]: value };

      // Auto-toggle TLS/SSL switch when standard ports are typed
      if (key === 'smtp.port') {
        const portNum = Number(value);
        if (portNum === 465) {
          next['smtp.secure'] = true;
        } else if (portNum === 587 || portNum === 25) {
          next['smtp.secure'] = false;
        }
      }

      return next;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload: Array<{
        key: string;
        category: string;
        value: any;
        valueType?: string;
        isSecret?: boolean;
      }> = [
        { key: 'smtp.host', category: 'Email', value: configs['smtp.host'] },
        { key: 'smtp.port', category: 'Email', value: configs['smtp.port'], valueType: 'number' },
        { key: 'smtp.user', category: 'Email', value: configs['smtp.user'] },
        { key: 'smtp.secure', category: 'Email', value: configs['smtp.secure'], valueType: 'boolean' },
        { key: 'email.from.name', category: 'Email', value: configs['email.from.name'] },
        { key: 'email.from.address', category: 'Email', value: configs['email.from.address'] },
      ];

      // Only pass password if user entered a new one, or pass empty string to preserve
      if (configs['smtp.pass'] && configs['smtp.pass'].trim() !== '') {
        payload.push({
          key: 'smtp.pass',
          category: 'Email',
          value: configs['smtp.pass'],
          isSecret: true,
        });
      } else if (!isPasswordConfigured) {
        payload.push({
          key: 'smtp.pass',
          category: 'Email',
          value: '',
          isSecret: true,
        });
      }

      const result = await saveConfigAction(payload);
      if (result.success) {
        toast.success('Email configuration saved successfully.');
        if (configs['smtp.pass'] && configs['smtp.pass'].trim() !== '') {
          setIsPasswordConfigured(true);
          setConfigs((prev) => ({ ...prev, 'smtp.pass': '' }));
        }
      } else {
        toast.error(result.error || 'Failed to save configuration.');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunConnectionTest = async () => {
    setTestingConnection(true);
    setTestResult(null);

    try {
      const result = await testEmailConnectionAction({
        host: configs['smtp.host'],
        port: configs['smtp.port'],
        user: configs['smtp.user'],
        pass: configs['smtp.pass'] || undefined,
        secure: configs['smtp.secure'],
        fromName: configs['email.from.name'],
        fromAddress: configs['email.from.address'],
        testRecipient: sendTestMail ? testRecipient.trim() : undefined,
      });

      setTestResult(result);
      if (result.success) {
        toast.success(result.message || 'Connection test successful!');
      } else {
        toast.error(result.error || 'Connection test failed.');
      }
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || 'Connection test failed unexpectedly.' });
      toast.error(err.message || 'Test failed.');
    } finally {
      setTestingConnection(false);
    }
  };

  const isConfigured = Boolean(configs['smtp.host'] && (configs['smtp.user'] ? isPasswordConfigured || configs['smtp.pass'] : true));
  const previewSender = configs['email.from.name']
    ? `"${configs['email.from.name']}" <${configs['email.from.address'] || 'no-reply@nazexa.com'}>`
    : configs['email.from.address'] || 'no-reply@nazexa.com';

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading email configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold tracking-tight">Email Settings</h1>
            {isConfigured ? (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Configured
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Setup Needed
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-2">
            Configure SMTP servers, credentials, and sender addresses for transactional and system emails.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadConfigs}
            disabled={loading || fetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reload
          </Button>
        </div>
      </div>

      {/* SMTP Server Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-primary" />
            <CardTitle>SMTP Server Configuration</CardTitle>
          </div>
          <CardDescription>
            Specify your SMTP host, port, and security mechanism.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input
                id="smtp-host"
                value={configs['smtp.host']}
                onChange={(e) => handleChange('smtp.host', e.target.value)}
                placeholder="smtp.gmail.com or mail.example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">Port</Label>
              <Input
                id="smtp-port"
                type="number"
                value={configs['smtp.port']}
                onChange={(e) => handleChange('smtp.port', e.target.value)}
                placeholder="587"
              />
              <p className="text-xs text-muted-foreground">587 (STARTTLS) or 465 (SSL/TLS)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-user">SMTP Username</Label>
              <Input
                id="smtp-user"
                value={configs['smtp.user']}
                onChange={(e) => handleChange('smtp.user', e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="smtp-pass">SMTP Password</Label>
                {isPasswordConfigured && (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Encrypted password saved
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="smtp-pass"
                  type={showPassword ? 'text' : 'password'}
                  value={configs['smtp.pass']}
                  onChange={(e) => handleChange('smtp.pass', e.target.value)}
                  placeholder={isPasswordConfigured ? '•••••••••••• (leave blank to keep current)' : 'Enter SMTP password'}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {isPasswordConfigured
                  ? 'Your password is encrypted at rest (AES-256-GCM). Leave blank to keep existing password.'
                  : 'Enter the SMTP account password or application-specific password.'}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="smtp-secure" className="text-sm font-medium">Use TLS/SSL Encryption</Label>
              <p className="text-xs text-muted-foreground">
                Enable for direct SSL/TLS connections on port 465. Keep disabled for port 587 (STARTTLS).
              </p>
            </div>
            <Switch
              id="smtp-secure"
              checked={configs['smtp.secure'] === true}
              onCheckedChange={(v) => handleChange('smtp.secure', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sender Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-primary" />
            <CardTitle>Sender Details</CardTitle>
          </div>
          <CardDescription>
            The display name and email address that appear in the "From" header of outgoing emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-name">From Name</Label>
              <Input
                id="from-name"
                value={configs['email.from.name']}
                onChange={(e) => handleChange('email.from.name', e.target.value)}
                placeholder="Nazexa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-address">From Email Address</Label>
              <Input
                id="from-address"
                type="email"
                value={configs['email.from.address']}
                onChange={(e) => handleChange('email.from.address', e.target.value)}
                placeholder="no-reply@nazexa.com"
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 border text-sm flex items-center gap-2 text-muted-foreground">
            <span className="font-semibold text-foreground">Header Preview:</span>
            <code className="text-xs bg-background px-2 py-0.5 rounded border text-foreground">{previewSender}</code>
          </div>
        </CardContent>
      </Card>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setTestResult(null);
            setTestDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Test Connection
        </Button>

        <Button onClick={handleSave} disabled={loading} className="min-w-[140px]">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            'Save Configuration'
          )}
        </Button>
      </div>

      {/* Test Connection Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              Test SMTP Connection
            </DialogTitle>
            <DialogDescription>
              Test connection and credentials with {configs['smtp.host'] || 'configured host'}:{configs['smtp.port'] || '587'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="test-recipient">Send Test Email To (Optional)</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="send-mail-check"
                    checked={sendTestMail}
                    onChange={(e) => setSendTestMail(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="send-mail-check" className="text-xs text-muted-foreground cursor-pointer">
                    Dispatch message
                  </label>
                </div>
              </div>
              <Input
                id="test-recipient"
                type="email"
                disabled={!sendTestMail || testingConnection}
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="admin@example.com"
              />
              <p className="text-xs text-muted-foreground">
                {sendTestMail
                  ? 'A sample test email will be sent to verify inbox deliverability.'
                  : 'Only the network connection and SMTP handshake will be tested.'}
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg border text-sm flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-destructive/10 border-destructive/30 text-destructive'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-destructive" />
                )}
                <div className="text-xs leading-relaxed space-y-1">
                  <p className="font-semibold">{testResult.success ? 'Connection Successful' : 'Connection Failed'}</p>
                  <p>{testResult.message || testResult.error}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex sm:justify-between items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setTestDialogOpen(false)}
              disabled={testingConnection}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={handleRunConnectionTest}
              disabled={testingConnection}
              className="flex items-center gap-2"
            >
              {testingConnection ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Testing Handshake...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Run Test</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
