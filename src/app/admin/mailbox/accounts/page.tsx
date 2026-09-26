'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, CheckCircle2, XCircle, Loader2,
  RefreshCw, Mail, Circle, ChevronDown, ChevronUp, AlertTriangle, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MailAccount {
  id: string;
  displayName: string;
  email: string;
  provider: string;
  imapHost: string;
  imapPort: number;
  imapSecurity: string;
  imapUsername: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecurity: string;
  smtpUsername: string;
  signature?: string;
  status: string;
  lastSyncAt?: string;
  lastSyncError?: string;
  lastSyncCount: number;
  unreadCount: number;
}

interface AccountFormData {
  displayName: string;
  email: string;
  provider: string;
  imapHost: string;
  imapPort: string;
  imapSecurity: string;
  imapUsername: string;
  imapPassword: string;
  smtpHost: string;
  smtpPort: string;
  smtpSecurity: string;
  smtpUsername: string;
  smtpPassword: string;
  signature: string;
}

const emptyForm: AccountFormData = {
  displayName: '', email: '', provider: 'custom',
  imapHost: '', imapPort: '993', imapSecurity: 'SSL/TLS', imapUsername: '', imapPassword: '',
  smtpHost: '', smtpPort: '587', smtpSecurity: 'STARTTLS', smtpUsername: '', smtpPassword: '',
  signature: '',
};

const PROVIDER_PRESETS: Record<string, Partial<AccountFormData>> = {
  gmail: { imapHost: 'imap.gmail.com', imapPort: '993', imapSecurity: 'SSL/TLS', smtpHost: 'smtp.gmail.com', smtpPort: '587', smtpSecurity: 'STARTTLS' },
  outlook: { imapHost: 'outlook.office365.com', imapPort: '993', imapSecurity: 'SSL/TLS', smtpHost: 'smtp.office365.com', smtpPort: '587', smtpSecurity: 'STARTTLS' },
  yahoo: { imapHost: 'imap.mail.yahoo.com', imapPort: '993', imapSecurity: 'SSL/TLS', smtpHost: 'smtp.mail.yahoo.com', smtpPort: '465', smtpSecurity: 'SSL/TLS' },
};

export default function MailAccountsPage() {
  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<MailAccount | null>(null);
  const [form, setForm] = useState<AccountFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { imap: boolean; smtp: boolean; imapError?: string; smtpError?: string }>>({});
  const [syncing, setSyncing] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    const res = await fetch('/api/admin/mailbox/accounts');
    if (res.ok) {
      const data = await res.json();
      setAccounts(data.accounts);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleProviderChange = (provider: string) => {
    const preset = PROVIDER_PRESETS[provider] || {};
    setForm(prev => ({ ...prev, provider, ...preset }));
  };

  const handleEmailBlur = () => {
    if (form.email && !form.imapUsername) {
      setForm(prev => ({ ...prev, imapUsername: form.email, smtpUsername: form.email }));
    }
    if (form.email && !form.displayName) {
      setForm(prev => ({ ...prev, displayName: form.email }));
    }
  };

  const handleSubmit = async () => {
    if (!form.email || !form.imapHost || !form.smtpHost) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!editingAccount && (!form.imapPassword || !form.smtpPassword)) {
      toast.error('Passwords are required when creating a new account');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingAccount
        ? `/api/admin/mailbox/accounts/${editingAccount.id}`
        : '/api/admin/mailbox/accounts';
      const method = editingAccount ? 'PATCH' : 'POST';

      const body: any = { ...form };
      if (!body.imapPassword) delete body.imapPassword;
      if (!body.smtpPassword) delete body.smtpPassword;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editingAccount ? 'Account updated' : 'Account connected');
        setShowForm(false);
        setEditingAccount(null);
        setForm(emptyForm);
        fetchAccounts();
      } else {
        toast.error(data.error || 'Failed to save account');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTest = async (accountId: string) => {
    setTesting(accountId);
    try {
      const res = await fetch(`/api/admin/mailbox/accounts/${accountId}/test`, { method: 'POST' });
      const data = await res.json();
      setTestResults(prev => ({ ...prev, [accountId]: data.results }));
      if (data.ok) toast.success('Connection test passed!');
      else toast.error('Connection test failed — check the results');
    } finally {
      setTesting(null);
    }
  };

  const handleSync = async (accountId: string) => {
    setSyncing(accountId);
    try {
      const res = await fetch(`/api/admin/mailbox/accounts/${accountId}/sync`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Synced — ${data.result.messagesAdded} new messages`);
        fetchAccounts();
      } else {
        toast.error('Sync failed');
      }
    } finally {
      setSyncing(null);
    }
  };

  const handleEdit = (account: MailAccount) => {
    setEditingAccount(account);
    setForm({
      displayName: account.displayName,
      email: account.email,
      provider: account.provider,
      imapHost: account.imapHost,
      imapPort: String(account.imapPort),
      imapSecurity: account.imapSecurity,
      imapUsername: account.imapUsername,
      imapPassword: '',
      smtpHost: account.smtpHost,
      smtpPort: String(account.smtpPort),
      smtpSecurity: account.smtpSecurity,
      smtpUsername: account.smtpUsername,
      smtpPassword: '',
      signature: account.signature || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (accountId: string) => {
    const res = await fetch(`/api/admin/mailbox/accounts/${accountId}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Account disconnected');
      fetchAccounts();
    } else {
      toast.error('Failed to delete account');
    }
  };

  const statusColor = (status: string) => {
    if (status === 'active') return 'text-green-500 fill-green-500';
    if (status === 'error') return 'text-red-500 fill-red-500';
    return 'text-muted-foreground fill-muted-foreground';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" asChild className="shrink-0 mt-0.5">
            <Link href="/admin/mailbox">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mail Accounts</h1>
            <p className="text-muted-foreground text-sm mt-1">Connect and manage external email accounts</p>
          </div>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingAccount(null); setForm(emptyForm); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Account
        </Button>
      </div>

      {/* Account list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : accounts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Mail className="h-12 w-12 mb-4 opacity-30" />
            <p className="font-medium">No mail accounts connected</p>
            <p className="text-sm mt-1">Add your first email account to get started</p>
            <Button className="mt-4 gap-2" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> Add Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {accounts.map(account => {
            const result = testResults[account.id];
            return (
              <Card key={account.id}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{account.displayName}</p>
                          <Circle className={cn('h-2 w-2 shrink-0', statusColor(account.status))} />
                          <Badge variant={account.status === 'active' ? 'default' : 'destructive'} className="text-xs px-1.5 py-0">
                            {account.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{account.email}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          IMAP: {account.imapHost}:{account.imapPort} · SMTP: {account.smtpHost}:{account.smtpPort}
                        </p>
                        {account.lastSyncAt && (
                          <p className="text-xs text-muted-foreground">
                            Last sync: {format(new Date(account.lastSyncAt), 'PPp')} · {account.lastSyncCount} new
                          </p>
                        )}
                        {account.lastSyncError && (
                          <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="h-3 w-3" /> {account.lastSyncError.slice(0, 100)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {account.unreadCount > 0 && (
                        <Badge variant="secondary">{account.unreadCount} unread</Badge>
                      )}
                      <Button
                        variant="outline" size="sm" className="gap-1.5"
                        onClick={() => handleTest(account.id)}
                        disabled={testing === account.id}
                      >
                        {testing === account.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Test
                      </Button>
                      <Button
                        variant="outline" size="sm" className="gap-1.5"
                        onClick={() => handleSync(account.id)}
                        disabled={syncing === account.id}
                      >
                        {syncing === account.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        Sync
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(account)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect Account?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove <strong>{account.email}</strong> and delete all synced messages and attachments for this account. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(account.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Disconnect
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Test results */}
                  {result && (
                    <div className="mt-4 p-3 rounded-md border bg-muted/30 space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        {result.imap
                          ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                          : <XCircle className="h-4 w-4 text-red-500" />}
                        <span>IMAP {result.imap ? 'connected' : 'failed'}</span>
                        {result.imapError && <span className="text-muted-foreground text-xs">{result.imapError}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {result.smtp
                          ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                          : <XCircle className="h-4 w-4 text-red-500" />}
                        <span>SMTP {result.smtp ? 'connected' : 'failed'}</span>
                        {result.smtpError && <span className="text-muted-foreground text-xs">{result.smtpError}</span>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingAccount(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Account' : 'Connect Mail Account'}</DialogTitle>
            <DialogDescription>Configure IMAP and SMTP settings for your email account.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Provider */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Email Address *</Label>
                <Input
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  onBlur={handleEmailBlur}
                  disabled={!!editingAccount}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Display Name</Label>
                <Input
                  placeholder="Support Team"
                  value={form.displayName}
                  onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Provider Preset</Label>
              <Select value={form.provider} onValueChange={handleProviderChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="outlook">Outlook / Office 365</SelectItem>
                  <SelectItem value="yahoo">Yahoo Mail</SelectItem>
                  <SelectItem value="custom">Custom / Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* IMAP */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">IMAP (Receiving)</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>IMAP Host *</Label>
                  <Input placeholder="imap.example.com" value={form.imapHost} onChange={e => setForm(p => ({ ...p, imapHost: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Port</Label>
                  <Input type="number" value={form.imapPort} onChange={e => setForm(p => ({ ...p, imapPort: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Security</Label>
                  <Select value={form.imapSecurity} onValueChange={v => setForm(p => ({ ...p, imapSecurity: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SSL/TLS">SSL/TLS</SelectItem>
                      <SelectItem value="STARTTLS">STARTTLS</SelectItem>
                      <SelectItem value="NONE">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Username</Label>
                  <Input placeholder="Same as email" value={form.imapUsername} onChange={e => setForm(p => ({ ...p, imapUsername: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Password / App Password {editingAccount && <span className="text-muted-foreground font-normal">(leave blank to keep current)</span>}</Label>
                <Input type="password" placeholder="••••••••" value={form.imapPassword} onChange={e => setForm(p => ({ ...p, imapPassword: e.target.value }))} />
              </div>
            </div>

            {/* SMTP */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">SMTP (Sending)</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>SMTP Host *</Label>
                  <Input placeholder="smtp.example.com" value={form.smtpHost} onChange={e => setForm(p => ({ ...p, smtpHost: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Port</Label>
                  <Input type="number" value={form.smtpPort} onChange={e => setForm(p => ({ ...p, smtpPort: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Security</Label>
                  <Select value={form.smtpSecurity} onValueChange={v => setForm(p => ({ ...p, smtpSecurity: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SSL/TLS">SSL/TLS</SelectItem>
                      <SelectItem value="STARTTLS">STARTTLS</SelectItem>
                      <SelectItem value="NONE">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Username</Label>
                  <Input placeholder="Same as email" value={form.smtpUsername} onChange={e => setForm(p => ({ ...p, smtpUsername: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Password / App Password {editingAccount && <span className="text-muted-foreground font-normal">(leave blank to keep current)</span>}</Label>
                <Input type="password" placeholder="••••••••" value={form.smtpPassword} onChange={e => setForm(p => ({ ...p, smtpPassword: e.target.value }))} />
              </div>
            </div>

            {/* Signature */}
            <div className="space-y-1.5">
              <Label>Email Signature <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                placeholder="Best regards,&#10;Your Name&#10;Your Company"
                rows={4}
                value={form.signature}
                onChange={e => setForm(p => ({ ...p, signature: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingAccount(null); }}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingAccount ? 'Save Changes' : 'Connect Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
