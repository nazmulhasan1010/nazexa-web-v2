'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

export default function SupportSettings() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Category Form State
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [submittingCat, setSubmittingCat] = useState(false);

  // Template Form State
  const [tplName, setTplName] = useState('');
  const [tplSubject, setTplSubject] = useState('');
  const [tplBody, setTplBody] = useState('');
  const [tplEvent, setTplEvent] = useState('');
  const [tplOpen, setTplOpen] = useState(false);
  const [submittingTpl, setSubmittingTpl] = useState(false);

  const fetchConfig = () => {
    fetch('/api/admin/support/config')
      .then(r => r.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleCreateCategory = async () => {
    if (!catName) return;
    setSubmittingCat(true);
    try {
      const res = await fetch('/api/admin/support/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_category', name: catName, description: catDesc })
      });
      if (res.ok) {
        setCatOpen(false);
        setCatName('');
        setCatDesc('');
        fetchConfig();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch(e: any) {
      alert(e.message);
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!tplName || !tplSubject || !tplBody) return;
    setSubmittingTpl(true);
    try {
      const res = await fetch('/api/admin/support/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_template', name: tplName, subject: tplSubject, body: tplBody })
      });
      if (res.ok) {
        setTplOpen(false);
        setTplName('');
        setTplSubject('');
        setTplBody('');
        fetchConfig();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch(e: any) {
      alert(e.message);
    } finally {
      setSubmittingTpl(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/support"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Support Settings</h2>
          <p className="text-muted-foreground">Manage support categories and email templates. (Products are managed via Applications)</p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Support issue categories like Billing, Technical, Bug Report.</CardDescription>
              </div>
              <Dialog open={catOpen} onOpenChange={setCatOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4"/> Add Category</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Billing" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Input value={catDesc} onChange={e => setCatDesc(e.target.value)} placeholder="e.g. Issues with payments" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateCategory} disabled={submittingCat || !catName}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config?.categories?.length === 0 && <p className="text-sm text-muted-foreground">No categories configured.</p>}
                {config?.categories?.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-muted-foreground">{c.description}</div>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Automated email templates for support events (Handlebars syntax allowed).</CardDescription>
              </div>
              <Dialog open={tplOpen} onOpenChange={setTplOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4"/> Add Template</Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Add Email Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Event Name</label>
                      <Input value={tplName} onChange={e => setTplName(e.target.value)} placeholder="e.g. TICKET_CREATED" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Subject</label>
                      <Input value={tplSubject} onChange={e => setTplSubject(e.target.value)} placeholder="Ticket #{{ticket.number}} Created" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">HTML Body</label>
                      <Textarea value={tplBody} onChange={e => setTplBody(e.target.value)} placeholder="<p>Hi {{user.name}},</p>" className="font-mono text-sm h-32" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateTemplate} disabled={submittingTpl || !tplName || !tplSubject || !tplBody}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config?.templates?.length === 0 && <p className="text-sm text-muted-foreground">No templates configured.</p>}
                {config?.templates?.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-sm text-muted-foreground">Subject: {t.subject}</div>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
