'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function MailSubscribersClient({
  activeCount,
  initialHistory,
}: {
  activeCount: number;
  initialHistory: any[];
}) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  async function handleSend() {
    if (!subject.trim() || !content.trim()) {
      toast.error('Please enter a subject and content.');
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch('/api/admin/newsletters/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, html: content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign');

      toast.success('Campaign successfully queued for delivery!');
      setSubject('');
      setContent('');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mail Subscribers</h1>
        <p className="text-muted-foreground mt-2">
          Send updates, announcements and important information to your Nazexa subscriber community.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Email Composer</CardTitle>
              <CardDescription>
                Design and send a beautiful email to your active subscribers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g. Introducing Nazexa Cloud"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Content</Label>
                <RichTextEditor value={content} onChange={setContent} />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 flex items-center justify-between border-t p-6">
              <div className="text-muted-foreground text-sm">
                <span className="text-foreground font-semibold">
                  {activeCount.toLocaleString()}
                </span>{' '}
                active recipients
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={isSending || activeCount === 0}>
                    {isSending ? 'Queuing...' : 'Send to Subscribers'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Send email to {activeCount.toLocaleString()} subscribers?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will immediately queue the email to be sent to all currently
                      active subscribers.
                      <br />
                      <br />
                      <strong>Subject:</strong> {subject}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSend} className="bg-primary">
                      Confirm Send
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeCount.toLocaleString()}</div>
              <p className="text-muted-foreground mt-1 text-sm">
                Total active subscribers who will receive this email.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign History</CardTitle>
          <CardDescription>Recent newsletter campaigns and their delivery status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No campaigns found.
                  </TableCell>
                </TableRow>
              ) : (
                initialHistory.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {campaign.sentCount} / {campaign.totalRecipients}
                      {campaign.failedCount > 0 && (
                        <span className="ml-2 text-red-500">({campaign.failedCount} failed)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          campaign.status === 'COMPLETED'
                            ? 'default'
                            : campaign.status === 'FAILED'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(campaign.createdAt), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
