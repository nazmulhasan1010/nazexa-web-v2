'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, UploadCloud, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewTicketPage() {
  const router = useRouter();
  const [config, setConfig] = useState<any>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productId, setProductId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/support/config')
      .then(r => r.json())
      .then(data => setConfig(data));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const newAttachments = [...attachments];
    
    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch('/api/support/upload', {
          method: 'POST',
          body: formData
        });
        
        if (res.ok) {
          const data = await res.json();
          newAttachments.push(data);
        }
      }
      setAttachments(newAttachments);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
      // reset file input
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body,
          categoryId: categoryId || undefined,
          productId: productId || undefined,
          attachments
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Ticket created successfully!");
        setTimeout(() => {
          router.push(`/support/tickets/${data.ticket.id}`);
        }, 800);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to create ticket");
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto space-y-6 py-24 px-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/support/tickets"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Ticket</h1>
          <p className="text-muted-foreground">Describe your issue and we'll get back to you soon.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Brief summary of your issue"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {config?.categories?.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Product (Optional)</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {config?.products?.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Details</Label>
              <Textarea 
                id="body" 
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Please provide as much detail as possible..."
                className="min-h-[200px]"
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Attachments</Label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Files
                  <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
                {uploading && <span className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Uploading...</span>}
              </div>
              
              {attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center justify-between p-2 text-sm border rounded-md bg-muted/50">
                      <span className="truncate max-w-[200px]">{att.fileName}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => removeAttachment(i)} type="button">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={submitting || uploading || !subject || !body}>
              {submitting ? 'Submitting...' : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Ticket
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
