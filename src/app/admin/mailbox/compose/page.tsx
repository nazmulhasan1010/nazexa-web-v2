'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Send, Loader2, Plus, X, Paperclip, ChevronDown, RotateCcw, Image as ImageIcon, Link as LinkIcon, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { TemplateSelector } from './components/TemplateSelector';
import { VariableForm, extractVariables } from './components/VariableForm';
import { renderTemplateString } from '@/lib/email/renderer';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface MailAccount {
  id: string;
  email: string;
  displayName: string;
  signature?: string;
}

function TagInput({
  values,
  onChange,
  placeholder,
}: {
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
    <div className="flex flex-1 flex-wrap gap-1.5 items-center bg-transparent group">
      {values.map(v => (
        <span key={v} className="flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 bg-muted/60 hover:bg-muted text-foreground border rounded-full text-[13px] font-medium transition-colors">
          {v}
          <button type="button" onClick={() => onChange(values.filter(x => x !== v))} className="text-muted-foreground hover:text-foreground rounded-full p-0.5 transition-colors">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[200px] bg-transparent outline-none text-[14px] px-1 py-1 placeholder:text-muted-foreground/60"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addValue(); }
          if (e.key === 'Backspace' && !input && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={addValue}
        placeholder={values.length === 0 ? placeholder : ''}
      />
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
            setBody(`<p><br><br></p><p>--<br>${data.accounts[0].signature.replace(/\n/g, '<br>')}</p>`);
          }
        }
      });
  }, []);

  useEffect(() => {
    const msgId = replyToId || replyAllId || forwardId;
    if (!msgId) return;

    fetch(`/api/admin/mailbox/messages/` + msgId)
      .then(res => res.json())
      .then(data => {
        const msg = data.message;
        if (!msg) return;

        if (replyToId || replyAllId) {
          setTo([msg.fromEmail]);
          setSubject(msg.subject.startsWith('Re:') ? msg.subject : `Re: ` + msg.subject);
          if (replyAllId) {
            const toList = JSON.parse(msg.toAddresses || '[]');
            setCc(toList.map((a: any) => a.email).filter((e: string) => e !== msg.fromEmail));
          }
        } else {
          setSubject(`Fwd: ` + msg.subject);
        }

        const selectedAccount = accounts.find(a => a.id === selectedAccountId);
        const sig = selectedAccount?.signature ? `<p><br><br></p><p>--<br>${selectedAccount.signature.replace(/\n/g, '<br>')}</p>` : '<p><br><br></p>';
        const quotedBody = `<blockquote><p>--- Original Message ---<br>From: ${msg.fromEmail}<br>Date: ${new Date(msg.date).toLocaleString()}<br>Subject: ${msg.subject}</p>${msg.bodyHtml || msg.bodyText?.replace(/\n/g, '<br>') || ''}</blockquote>`;
        setBody(sig + quotedBody);
      });
  }, [replyToId, replyAllId, forwardId, accounts, selectedAccountId]);

  const loadTemplate = async (id: string) => {
    setLoadingTemplate(true);
    try {
      const res = await fetch(`/api/admin/emails/templates/` + id);
      const data = await res.json();
      if (data.template) {
        setTemplateId(id);
        setTemplateHtml(data.template.contentHtml);
        setTemplateSubject(data.template.subject);
        setSubject(data.template.subject);
        
        const newVars: Record<string, any> = {};
        if (to.length === 1) {
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
          toast.error(file.name + ' is larger than 15MB');
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
    const finalHtml = templateId ? renderTemplateString(templateHtml, variableValues) : body;
    const finalText = templateId ? undefined : undefined; 

    if (!to.length || !selectedAccountId) {
      toast.error('Please fill in To and select an account');
      return;
    }

    if (templateId) {
      const varsInUse = [...extractVariables(templateHtml), ...extractVariables(subject)];
      const manualVars = varsInUse.filter(k => !['currentYear', 'currentDate', 'company.name', 'company.website', 'company.email'].includes(k));
      const missing = manualVars.filter(v => !variableValues[v]);
      if (missing.length > 0) {
        toast.error('Missing required variables: ' + missing.join(', '));
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
    <div className={cn("flex h-full w-full bg-muted/20 relative", templateId ? "flex-col lg:flex-row overflow-y-auto lg:overflow-hidden" : "")}>
      <div className={cn("flex flex-col h-full overflow-y-auto transition-all duration-300 shrink-0", templateId ? "w-full lg:w-1/2 lg:border-r p-4 md:p-6" : "w-full max-w-4xl mx-auto p-4 md:p-8")}>
        
        <div className="flex items-center justify-between mb-6 shrink-0 gap-4">
          <h1 className="text-2xl font-bold tracking-tight">New Message</h1>
          <div className="flex items-center gap-2">
            {!templateId && <TemplateSelector onSelect={loadTemplate} />}
            {templateId && (
              <Button variant="outline" size="sm" onClick={resetTemplate} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-destructive/20">
                <RotateCcw className="h-4 w-4 mr-2" />
                Discard Template
              </Button>
            )}
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </div>

        {loadingTemplate ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-background rounded-2xl shadow-sm border h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading template...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-background rounded-xl shadow-sm border overflow-hidden">
            
            {/* Form Header */}
            <div className="flex flex-col">
              
              {/* Account Selector */}
              <div className="flex items-center px-5 py-2.5 border-b focus-within:bg-muted/10 transition-colors">
                <span className="w-16 text-muted-foreground text-[14px] font-medium shrink-0">From</span>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger className="flex-1 bg-transparent border-0 shadow-none focus:ring-0 p-0 h-auto font-medium text-[14px]">
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
              </div>

              {/* To Field */}
              <div className="flex items-center px-5 py-2 border-b group">
                <span className="w-16 text-muted-foreground text-[14px] font-medium shrink-0">To</span>
                <TagInput values={to} onChange={setTo} placeholder="Recipients..." />
                <button
                  type="button" 
                  className="text-[12px] font-medium text-muted-foreground/60 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
                  onClick={() => setShowCcBcc(!showCcBcc)}
                >
                  {showCcBcc ? 'Hide Cc/Bcc' : 'Cc/Bcc'}
                </button>
              </div>

              {/* CC / BCC Fields */}
              {showCcBcc && (
                <>
                  <div className="flex items-center px-5 py-2 border-b">
                    <span className="w-16 text-muted-foreground text-[14px] font-medium shrink-0">Cc</span>
                    <TagInput values={cc} onChange={setCc} />
                  </div>
                  <div className="flex items-center px-5 py-2 border-b">
                    <span className="w-16 text-muted-foreground text-[14px] font-medium shrink-0">Bcc</span>
                    <TagInput values={bcc} onChange={setBcc} />
                  </div>
                </>
              )}

              {/* Subject Field */}
              <div className="flex items-center px-5 py-3 border-b focus-within:bg-muted/10 transition-colors">
                <span className="w-16 text-muted-foreground text-[14px] font-medium shrink-0">Subject</span>
                <div className="flex-1 flex flex-col">
                  <input
                    className="w-full bg-transparent outline-none text-[14px] font-semibold placeholder:text-muted-foreground/60 placeholder:font-normal"
                    placeholder="Enter subject line..."
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                  />
                  {templateId && subject.includes('{{') && (
                    <span className="text-xs text-muted-foreground mt-1 font-normal">
                      Preview: <span className="font-medium text-foreground">{renderedSubject || '...'}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Email Body Area */}
            <div className="flex-1 flex flex-col min-h-[350px]">
              {templateId ? (
                <div className="p-6 flex-1 overflow-y-auto bg-muted/10">
                  <h3 className="text-sm font-semibold mb-4 text-foreground/80 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Template Variables
                  </h3>
                  <VariableForm 
                    templateHtml={templateHtml}
                    templateSubject={templateSubject}
                    values={variableValues}
                    onChange={(k, v) => setVariableValues(prev => ({ ...prev, [k]: v }))}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <RichTextEditor 
                    value={body} 
                    onChange={setBody} 
                    className="flex-1 flex flex-col gap-0 [&>div:first-child]:border-0 [&>div:first-child]:border-b [&>div:first-child]:rounded-none [&>div:first-child]:px-5 [&>div:first-child]:py-2 [&>div:first-child]:shadow-none [&>div:first-child]:bg-transparent"
                    contentClassName="flex-1 [&>div]:min-h-[300px] [&>div]:border-0 [&>div]:shadow-none [&>div]:focus-visible:ring-0 [&>div]:rounded-none [&>div]:px-5 [&>div]:py-4 [&>div]:text-[15px]"
                  />
                </div>
              )}
            </div>

            {/* Attachments Section */}
            {attachments.length > 0 && (
              <div className="px-5 py-4 border-t bg-muted/20">
                <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Attachments</h4>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2 bg-background shadow-sm text-sm px-3 py-1.5 rounded-lg border group">
                      <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col max-w-[150px]">
                        <span className="truncate font-medium text-xs" title={att.filename}>{att.filename}</span>
                        <span className="text-muted-foreground text-[10px]">{(att.size / 1024 / 1024).toFixed(1)}MB</span>
                      </div>
                      <button onClick={() => removeAttachment(i)} className="ml-1 text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer / Action Bar */}
            <div className="px-5 py-4 border-t bg-muted/10 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1">
                <label className="cursor-pointer group">
                  <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={uploadingAttachment} />
                  <div className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground group-hover:bg-muted group-hover:text-foreground transition-colors disabled:opacity-50">
                    {uploadingAttachment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                  </div>
                </label>
                <button type="button" className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Insert Image">
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button type="button" className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Insert Link">
                  <LinkIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" className="text-muted-foreground" onClick={() => toast.info('Save draft coming in next iteration')} disabled={sending}>
                  Discard
                </Button>
                
                <div className="flex items-center">
                  <Button onClick={handleSend} disabled={sending} className="gap-2 rounded-r-none pl-5 pr-4 shadow-sm hover:shadow-md transition-all">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="font-semibold">{sending ? 'Sending…' : 'Send'}</span>
                  </Button>
                  <Button variant="default" size="icon" className="rounded-l-none border-l border-primary-foreground/20 px-2 shadow-sm" disabled={sending} onClick={() => toast.info('Schedule send coming soon!')}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Right Column: Live Preview (Only when template is active) */}
      {templateId && (
        <div className="w-full lg:w-1/2 h-full min-h-[600px] lg:min-h-0 flex flex-col bg-muted/10 border-t lg:border-t-0 shrink-0">
          <div className="px-6 py-4 border-b bg-background flex items-center justify-between shrink-0 h-[72px]">
            <h2 className="font-semibold flex items-center gap-2 text-[15px]">
              Live Preview
              <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Preview Mode</span>
            </h2>
          </div>
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <div className="w-full h-full bg-white rounded-xl shadow-lg border border-border/50 overflow-hidden flex flex-col max-w-3xl mx-auto">
              <div className="bg-muted/20 border-b px-5 py-3 shrink-0 flex items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">Subject</span>
                <span className="text-sm font-medium text-foreground truncate">{renderedSubject || 'No subject'}</span>
              </div>
              <iframe 
                srcDoc={renderedHtml} 
                className="w-full flex-1 border-0 bg-white" 
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
