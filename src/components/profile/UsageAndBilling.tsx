"use client";

import { useEffect, useState } from "react";
import { CreditCard, ExternalLink, Activity, DollarSign, Database, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface OverviewData {
  product: { id: string; name: string };
  subscription: {
    status: string;
    planName: string;
    planSlug: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
  usage: {
    projects: { current: number; limit: number };
    tables: { current: number; limit: number };
    exports: { current: number; limit: number };
    aiRequests: { current: number; limit: number };
    collaborators: { current: number; limit: number };
  };
}

interface PurchaseItem {
  id: string;
  productName: string;
  planName: string;
  billingInterval: string;
  amount: string;
  currency: string;
  status: string;
  purchasedAt: string;
  gatewayName: string;
}

export function UsageAndBilling() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [overviewRes, purchasesRes] = await Promise.all([
          fetch("/api/products/nazexa-db/overview"),
          fetch("/api/products/nazexa-db/purchases?page=1&limit=10")
        ]);

        const overviewData = await overviewRes.json();
        const purchasesData = await purchasesRes.json();

        if (overviewData.error) throw new Error(overviewData.error);
        
        setOverview(overviewData.data);
        if (purchasesData.data && purchasesData.data.items) {
          setPurchases(purchasesData.data.items);
        }
      } catch (err: any) {
        console.error("Failed to load billing info", err);
        setError(err.message || "Failed to load billing information.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center py-20 text-center">
        <CreditCard className="h-12 w-12 text-destructive mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-destructive">Failed to Load Billing</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!overview) return null;

  const getPercentage = (current: number, limit: number) => {
    if (limit === -1 || limit === 0) return 0;
    return Math.min(100, Math.round((current / limit) * 100));
  };

  const getUsageText = (current: number, limit: number) => {
    if (limit === -1) return `${current} / Unlimited`;
    if (limit === 0) return `${current} / Not allowed`;
    return `${current} / ${limit}`;
  };

  return (
    <div className="p-8 space-y-8">
      <div className="h-32 w-full bg-linear-to-r from-primary/30 via-primary/10 to-transparent relative -mt-8 -mx-8 mb-8">
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-background/80" />
        <div className="absolute bottom-6 left-8 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 backdrop-blur-md">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Usage & Billing</h2>
            <p className="text-sm text-muted-foreground">
              Manage subscriptions and track product usage
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Subscription Overview */}
        <Card className="shadow-none border-border/50 bg-background/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              {overview.product.name}
            </CardTitle>
            <CardDescription>Current subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Plan</span>
              <Badge variant={overview.subscription.planSlug === "free" ? "secondary" : "default"}>
                {overview.subscription.planName}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Status</span>
              <div className="flex items-center gap-2">
                {overview.subscription.status === "active" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : null}
                <span className="text-sm font-medium capitalize">{overview.subscription.status}</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Renews On</span>
              <span className="text-sm font-medium">
                {new Date(overview.subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full gap-2" asChild>
              <a href={`${process.env.NEXT_PUBLIC_NAZEXA_DB_URL || "http://localhost:8000"}/account`} target="_blank" rel="noopener noreferrer">
                Manage in Nazexa DB <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardFooter>
        </Card>

        {/* Usage Limits */}
        <Card className="shadow-none border-border/50 bg-background/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Usage Limits
            </CardTitle>
            <CardDescription>Your current billing period usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Projects</span>
                <span className="text-muted-foreground">{getUsageText(overview.usage.projects.current, overview.usage.projects.limit)}</span>
              </div>
              <Progress value={getPercentage(overview.usage.projects.current, overview.usage.projects.limit)} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Exports</span>
                <span className="text-muted-foreground">{getUsageText(overview.usage.exports.current, overview.usage.exports.limit)}</span>
              </div>
              <Progress value={getPercentage(overview.usage.exports.current, overview.usage.exports.limit)} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Team Members</span>
                <span className="text-muted-foreground">{getUsageText(overview.usage.collaborators.current, overview.usage.collaborators.limit)}</span>
              </div>
              <Progress value={getPercentage(overview.usage.collaborators.current, overview.usage.collaborators.limit)} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase History */}
      <Card className="shadow-none border-border/50 bg-background/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Purchase History
          </CardTitle>
          <CardDescription>Recent transactions across all Nazexa products</CardDescription>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No purchase history found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">
                      {new Date(purchase.purchasedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{purchase.productName}</TableCell>
                    <TableCell>{purchase.planName}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: purchase.currency,
                      }).format(Number(purchase.amount))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={purchase.status === 'completed' ? 'default' : purchase.status === 'pending' ? 'outline' : 'secondary'} className="capitalize">
                        {purchase.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
