import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin-auth.server';
import { redirect } from 'next/navigation';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SubscribersPage() {
  const session = await getAdminSession();
  if (!session?.user) redirect('/admin/login');

  const subscribers = await db.subscriber.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const total = subscribers.length;
  const active = subscribers.filter((s) => s.status === 'ACTIVE').length;
  const unsubscribed = subscribers.filter((s) => s.status === 'UNSUBSCRIBED').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscribers</h1>
        <p className="text-muted-foreground mt-2">Manage your newsletter and update subscribers.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{active.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Unsubscribed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unsubscribed.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscribed At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No subscribers found.
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={sub.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className={
                        sub.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : ''
                      }
                    >
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(sub.createdAt, 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
