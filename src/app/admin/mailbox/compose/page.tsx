'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Send, Loader2, Plus, X, Paperclip, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { TemplateSelector } from './components/TemplateSelector';
import { VariableForm, extractVariables } from './components/VariableForm';
import { renderTemplateString } from '@/lib/email/renderer';

interface MailAccount {
  id: string;
  email: string;
  displayName: string;
  signature?: string;
}

function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  const addValue = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInput('');
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5 min-h-9 p-2 border rounded-md bg-background focus-within:ring-1 focus-within:ring-ring">
        {values.map(v => (
          <span key={v} className="flex items-center gap-1 px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
            {v}
            <button type="button" onClick={() => onChange(values.filter(x => x !== v))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[150px] bg-transparent outline-none text-sm"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addValue(); }
            if (e.key === 'Backspace' && !input && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={addValue}
          placeholder={values.length === 0 ? (placeholder || 'Type email and press Enter') : ''}
        />
      </div>
    </div>
  );
}

function ComposePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const replyToId = searchParams.get('replyTo');
  const replyAllId = searchParams.get('replyAll');
  const forwardId = searchParams.get('forward');

  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [to, setTo] = useState<string[]>([]);
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<{ filename: string; url: string; size: number }[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Template State
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateHtml, setTemplateHtml] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  useEffect(() => {
    fetch('/api/admin/mailbox/accounts')
      .then(res => res.json())
      .then(data => {
        setAccounts(data.accounts || []);
        if (data.accounts?.length) {
          setSelectedAccountId(data.accounts[0].id);
          if (data.accounts[0].signature) {
            setBody(`\n\n--\n${data.accounts[0].signature}`);
          }
        }
      });
  }, []);

  // Pre-fill reply/forward fields
  useEffect(() => {
    const msgId = replyToId || replyAllId || forwardId;
    if (!msgId) return;

    fetch(`/api/admin/mailbox/messages/${msgId}`)
      .then(res => res.json())
      .then(data => {
        const msg = data.message;
        if (!msg) return;

        if (replyToId || replyAllId) {
          setTo([msg.fromEmail]);
          setSubject(msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`);
          if (replyAllId) {
            const toList = JSON.parse(msg.toAddresses || '[]');
            setCc(toList.map((a: any) => a.email).filter((e: string) => e !== msg.fromEmail));
          }
        } else {
          setSubject(`Fwd: ${msg.subject}`);
        }

        const selectedAccount = accounts.find(a => a.id === selectedAccountId);
        const sig = selectedAccount?.signature ? `\n\n--\n${selectedAccount.signature}` : '';
        const quotedBody = `\n\n--- Original Message ---\nFrom: ${msg.fromEmail}\nDate: ${new Date(msg.date).toLocaleString()}\nSubject: ${msg.subject}\n\n${msg.bodyText || ''}`;
        setBody(sig + quotedBody);
      });
  }, [replyToId, replyAllId, forwardId, accounts, selectedAccountId]);

  // Update signature when account changes
  useEffect(() => {
    if (templateId) return; // Don't append plain signature to templates
    const account = accounts.find(a => a.id === selectedAccountId);
    if (account?.signature) {
      setBody(prev => {
        const sigMarker = '\n\n--\n';
        const noSig = prev.includes(sigMarker) ? prev.slice(0, prev.indexOf(sigMarker)) : prev;
        return noSig + sigMarker + account.signature;
      });
    }
  }, [selectedAccountId, accounts, templateId]);

  const loadTemplate = async (id: string) => {
    setLoadingTemplate(true);
    try {
      const res = await fetch(`/api/admin/emails/templates/${id}`);
      const data = await res.json();
      if (data.template) {
        setTemplateId(id);
        setTemplateHtml(data.template.contentHtml);
        setTemplateSubject(data.template.subject);
        setSubject(data.template.subject);
        
        // Auto-populate values if possible (e.g. from existing reply context)
        const newVars: Record<string, any> = {};
        if (to.length === 1) {
          // If we have one recipient, try to guess name
          const email = to[0];
          newVars['user.email'] = email;
          newVars['user.name'] = email.split('@')[0]; 
        }
        setVariableValues(newVars);
      }
    } catch (err) {
      toast.error('Failed to load template');
    } finally {
      setLoadingTemplate(false);
    }
  };

  const resetTemplate = () => {
    if (confirm('Are you sure you want to discard this template and return to the normal composer?')) {
      setTemplateId(null);
      setTemplateHtml('');
      setTemplateSubject('');
      setVariableValues({});
      setSubject('');
      setBody('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingAttachment(true);
    try {
      for (const file of files) {
        if (file.size > 15 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 15MB`);
          continue;
        }
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/mailbox/attachments', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.url) {
          setAttachments(prev => [...prev, { filename: data.filename, url: data.url, size: data.size }]);
        } else {
          toast.error(data.error || 'Failed to upload attachment');
        }
      }
    } finally {
      setUploadingAttachment(false);
      // Reset input value to allow re-uploading the same file if needed
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const renderedSubject = useMemo(() => {
    if (!templateId) return subject;
    return renderTemplateString(subject, variableValues);
  }, [templateId, subject, variableValues]);

  const renderedHtml = useMemo(() => {
    if (!templateId) return '';
    return renderTemplateString(templateHtml, variableValues);
  }, [templateId, templateHtml, variableValues]);

  const handleSend = async () => {
    const finalSubject = templateId ? renderTemplateString(subject, variableValues) : subject;
    const finalHtml = templateId ? renderTemplateString(templateHtml, variableValues) : body.replace(/\n/g, '<br>');
    const finalText = templateId ? undefined : body;

    if (!to.length || !selectedAccountId) {
      toast.error('Please fill in To and select an account');
      return;
    }

    if (templateId) {
      const varsInUse = [...extractVariables(templateHtml), ...extractVariables(subject)];
      const manualVars = varsInUse.filter(k => !['currentYear', 'currentDate', 'company.name', 'company.website', 'company.email'].includes(k));
      const missing = manualVars.filter(v => !variableValues[v]);
      if (missing.length > 0) {
        toast.error(`Missing required variables: ${missing.join(', ')}`);
        return;
      }
    }

    setSending(true);
    try {
      const res = await fetch('/api/admin/mailbox/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccountId,
          to,
          cc: cc.length ? cc : undefined,
          bcc: bcc.length ? bcc : undefined,
          subject: finalSubject,
          html: finalHtml,
          text: finalText,
          attachments: attachments.length ? attachments : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Email sent successfully!');
        router.push('/admin/mailbox');
      } else {
        toast.error(data.error || 'Failed to send email');
      }
    } finally {
      setSending(false);
    }
  };



  return (
    <div className={cn("flex h-full w-full bg-muted/10", templateId ? "flex-col lg:flex-row overflow-y-auto lg:overflow-hidden" : "")}>
      <div className={cn("flex flex-col h-full overflow-y-auto p-4 md:p-6 transition-all duration-300 shrink-0", templateId ? "w-full lg:w-1/2 lg:border-r" : "w-full max-w-3xl mx-auto")}>
        <div className="flex items-center justify-between mb-6 shrink-0 flex-wrap gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Compose Email</h1>
          <div className="flex items-center gap-2">
            {!templateId && <TemplateSelector onSelect={loadTemplate} />}
            {templateId && (
              <Button variant="ghost" size="sm" onClick={resetTemplate} className="text-muted-foreground hover:text-destructive">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Mode
              </Button>
            )}
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </div>

        {loadingTemplate ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading template...</p>
          </div>
        ) : (
          <Card className="flex-1 shadow-sm">
            <CardContent className="pt-5 space-y-4">
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-4 items-center">
                <Label className="text-right text-muted-foreground">From</Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger className="bg-transparent border-0 shadow-none focus:ring-0 p-0 h-auto">
                    <SelectValue placeholder="Select account..." />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.displayName} &lt;{a.email}&gt;
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label className="text-right text-muted-foreground mt-2">To</Label>
                <TagInput label="" values={to} onChange={setTo} />

                {showCcBcc && (
                  <>
                    <Label className="text-right text-muted-foreground mt-2">CC</Label>
                    <TagInput label="" values={cc} onChange={setCc} />
                    <Label className="text-right text-muted-foreground mt-2">BCC</Label>
                    <TagInput label="" values={bcc} onChange={setBcc} />
                  </>
                )}
                
                <div />
                <button
                  type="button" 
                  className="text-xs text-muted-foreground hover:text-foreground text-left w-fit"
                  onClick={() => setShowCcBcc(!showCcBcc)}
                >
                  {showCcBcc ? 'Hide CC/BCC' : 'Add CC/BCC'}
                </button>

                <Label className="text-right text-muted-foreground mt-2">Subject</Label>
                <div className="flex flex-col gap-1 w-full">
                  <Input
                    className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto rounded-none border-b focus-visible:border-primary"
                    placeholder="Subject (optional)"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                  />
                  {templateId && subject.includes('{{') && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Preview: <span className="font-medium text-foreground">{renderedSubject || 'No Subject'}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-2" />

              {templateId ? (
                <div className="pt-2 pb-6">
                  <h3 className="text-sm font-semibold mb-4">Template Variables</h3>
                  <div className="h-[400px]">
                    <VariableForm 
                      templateHtml={templateHtml}
                      templateSubject={templateSubject}
                      values={variableValues}
                      onChange={(k, v) => setVariableValues(prev => ({ ...prev, [k]: v }))}
                    />
                  </div>
                </div>
              ) : (
                <textarea
                  className="w-full min-h-[400px] p-2 text-sm bg-transparent border-0 focus:outline-none resize-none font-sans"
                  placeholder="Write your message here..."
                  value={body}
                  onChange={e => setBody(e.target.value)}
                />
              )}

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 mt-auto border-t">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-1 bg-muted/50 text-xs px-2 py-1 rounded-md border">
                      <span className="truncate max-w-[150px]" title={att.filename}>{att.filename}</span>
                      <span className="text-muted-foreground text-[10px]">({(att.size / 1024 / 1024).toFixed(1)}MB)</span>
                      <button onClick={() => removeAttachment(i)} className="ml-1 text-muted-foreground hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 mt-auto border-t">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={uploadingAttachment} />
                    <Button variant="outline" size="sm" type="button" asChild disabled={uploadingAttachment}>
                      <span className="text-muted-foreground">
                        {uploadingAttachment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4 mr-1" />}
                        {uploadingAttachment ? 'Uploading...' : 'Attach Files'}
                      </span>
                    </Button>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => toast.info('Save draft coming in next iteration')} disabled={sending}>
                    Save Draft
                  </Button>
                  <Button onClick={handleSend} disabled={sending} className="gap-2 min-w-[120px]">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {sending ? 'Sending…' : 'Send Email'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column: Live Preview */}
      {templateId && (
        <div className="w-full lg:w-1/2 h-full min-h-[600px] lg:min-h-0 flex flex-col bg-muted/30 border-t lg:border-t-0 shrink-0">
          <div className="px-4 md:px-6 py-4 border-b bg-background flex items-center justify-between shrink-0 h-[72px]">
            <h2 className="font-semibold flex items-center gap-2">
              Live Preview
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Desktop</span>
            </h2>
          </div>
          <div className="flex-1 p-6 overflow-hidden">
            <div className="w-full h-full bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
              <div className="bg-muted/30 border-b px-4 py-3 shrink-0">
                <div className="text-sm"><span className="text-muted-foreground mr-2">Subject:</span> {renderedSubject}</div>
              </div>
              <iframe 
                srcDoc={renderedHtml} 
                className="w-full flex-1 border-0" 
                sandbox="allow-popups allow-same-origin"
                title="Email Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComposePage() {
  return (
    <Suspense>
      <ComposePageContent />
    </Suspense>
  );
}

