import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ConfigCardProps {
  title: string;
  description?: string;
  status: 'active' | 'warning' | 'error' | 'disabled';
  statusMessage?: string;
  lastUpdated?: Date;
  href: string;
  icon?: React.ElementType;
}

export function ConfigCard({
  title,
  description,
  status,
  statusMessage,
  lastUpdated,
  href,
  icon: Icon
}: ConfigCardProps) {
  
  const StatusIcon = status === 'active' ? CheckCircle2 : status === 'warning' ? AlertCircle : status === 'error' ? AlertCircle : Clock;
  const statusColor = status === 'active' ? 'text-green-500' : status === 'warning' ? 'text-amber-500' : status === 'error' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card className="flex flex-col hover:border-primary/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {description && <CardDescription className="mb-4">{description}</CardDescription>}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <StatusIcon className={`h-4 w-4 ${statusColor}`} />
            <span className={statusColor}>{statusMessage || status.charAt(0).toUpperCase() + status.slice(1)}</span>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <Link href={href} className="w-full">
          <Button variant="ghost" className="w-full justify-between">
            Manage
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
