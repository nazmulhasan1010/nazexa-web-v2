'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  rotateClientSecret,
} from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, Copy, RefreshCw, AppWindow, Check, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ApplicationsPage() {
  const { user } = useAdminAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [redirectUris, setRedirectUris] = useState('');
  const [allowedOrigins, setAllowedOrigins] = useState('');
  const [paymentWebhookUrl, setPaymentWebhookUrl] = useState('');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const apps = await getApplications();
      setApplications(apps);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (user?.role !== 'super_admin') {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold">Applications</h1>
        <p className="text-muted-foreground">You do not have permission to manage applications.</p>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId || !redirectUris) return;
    try {
      await createApplication({ name, clientId, redirectUris, allowedOrigins, paymentWebhookUrl });
      toast.success('Application registered successfully');
      setName('');
      setClientId('');
      setRedirectUris('');
      setAllowedOrigins('');
      setPaymentWebhookUrl('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to register application');
    }
  };

  const handleDelete = async (id: string, appName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the application "${appName}"? This will break SSO for any system relying on it.`
      )
    )
      return;
    try {
      await deleteApplication(id);
      toast.success('Application deleted');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete application');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateApplication(id, { status: newStatus });
      toast.success('Application status updated');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleRotateSecret = async (id: string, appName: string) => {
    if (
      !confirm(
        `Are you sure you want to rotate the secret for "${appName}"? The old secret will immediately stop working.`
      )
    )
      return;
    try {
      await rotateClientSecret(id);
      toast.success('Client secret rotated successfully');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to rotate secret');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-1">
            Manage connected ecosystem applications and SSO integrations.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Register New Application</CardTitle>
          <CardDescription>
            Register a new product to act as an OAuth2 / SSO client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Application Name</Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nazexa Support Portal"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Client ID (Slug)</Label>
              <Input
                required
                value={clientId}
                onChange={(e) =>
                  setClientId(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())
                }
                placeholder="nazexa-support"
              />
              <p className="text-muted-foreground text-xs">Unique identifier used by the client.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Redirect URIs</Label>
              <Input
                required
                value={redirectUris}
                onChange={(e) => setRedirectUris(e.target.value)}
                placeholder="http://localhost:5000/api/auth/sso"
              />
              <p className="text-muted-foreground text-xs">Comma-separated SSO callback URLs.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Allowed Origins (CORS)</Label>
              <Input
                value={allowedOrigins}
                onChange={(e) => setAllowedOrigins(e.target.value)}
                placeholder="http://localhost:5000"
              />
              <p className="text-muted-foreground text-xs">Comma-separated frontend origins.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Payment Webhook URL</Label>
              <Input
                value={paymentWebhookUrl}
                onChange={(e) => setPaymentWebhookUrl(e.target.value)}
                placeholder="https://api.myapp.com/webhooks/payments"
              />
              <p className="text-muted-foreground text-xs">Optional URL for payment events.</p>
            </div>
            <div className="pt-2 md:col-span-2">
              <Button type="submit">
                <AppWindow className="mr-2 h-4 w-4" /> Register Application
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-5 py-4 font-medium">Application</th>
                <th className="px-5 py-4 font-medium">Credentials</th>
                <th className="px-5 py-4 font-medium">Configuration</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-muted-foreground px-5 py-8 text-center">
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted-foreground px-5 py-8 text-center">
                    No applications registered yet.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 align-top">
                      <div className="text-base font-semibold">{app.name}</div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        Created: {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="space-y-3">
                        <div>
                          <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                            Client ID
                          </span>
                          <div className="bg-muted/30 mt-1 flex items-center gap-2 rounded-md border p-1.5">
                            <code className="flex-1 font-mono text-xs">{app.clientId}</code>
                            <button
                              onClick={() => copyToClipboard(app.clientId, app.id + 'id')}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {copiedId === app.id + 'id' ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                            Client Secret
                          </span>
                          <div className="bg-muted/30 mt-1 flex items-center gap-2 rounded-md border p-1.5">
                            <code className="flex-1 font-mono text-xs blur-[3px] transition-all hover:blur-none">
                              {app.clientSecret}
                            </code>
                            <button
                              onClick={() => copyToClipboard(app.clientSecret, app.id + 'sec')}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {copiedId === app.id + 'sec' ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-medium">Redirect URIs:</span>
                          <div className="text-muted-foreground mt-0.5 max-w-[200px] break-all">
                            {app.redirectUris}
                          </div>
                        </div>
                        {app.allowedOrigins && (
                          <div>
                            <span className="font-medium">Allowed Origins:</span>
                            <div className="text-muted-foreground mt-0.5 max-w-[200px] break-all">
                              {app.allowedOrigins}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <Select
                        value={app.status}
                        onValueChange={(val) => handleStatusChange(app.id, val)}
                      >
                        <SelectTrigger className="h-8 w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRotateSecret(app.id, app.name)}
                          title="Rotate Client Secret"
                        >
                          <RefreshCw className="mr-2 h-4 w-4 text-amber-500" />
                          Rotate
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(app.id, app.name)}
                          title="Delete Application"
                        >
                          <Trash2 className="text-destructive h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
