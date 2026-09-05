'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, type AdminGateway } from '@/lib/admin/api';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { GatewayCard } from '@/components/admin/payments/GatewayCard';
import { PaymentRequestsTable } from '@/components/admin/payments/PaymentRequestsTable';

export default function AdminPaymentsPage() {
  const [gateways, setGateways] = useState<AdminGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setGateways(await adminApi.gateways());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load gateways');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const enabledCount = gateways.filter((g) => g.isEnabled).length;

  const toggle = async (gateway: AdminGateway, next: boolean) => {
    // Mirrors the server guard so the admin gets the reason without a round trip.
    if (next && !gateway.isConfigured) {
      toast.error(`Complete required fields first: ${gateway.missingFields.join(', ')}`);
      return;
    }
    try {
      await adminApi.updateGateway({ id: gateway.id, isEnabled: next });
      toast.success(`${gateway.name} ${next ? 'enabled' : 'disabled'}`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="text-muted-foreground text-sm">
          Configure gateways and review submitted payments
        </p>
      </div>

      {enabledCount === 0 && !loading && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
          No gateway is enabled — users clicking <span className="font-medium">Purchase Plan</span>{' '}
          are sent to the contact page. Configure a gateway below to open checkout.
        </div>
      )}

      <Tabs defaultValue="gateways">
        <TabsList>
          <TabsTrigger value="gateways">
            Gateways
            {enabledCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-[10px]">
                {enabledCount} live
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests">
            Payment requests
            {pendingCount > 0 && <Badge className="ml-2 text-[10px]">{pendingCount}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="mt-4 space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          ) : (
            <>
              {gateways.map((g) => (
                <GatewayCard
                  key={g.id}
                  gateway={g}
                  onToggle={(next) => void toggle(g, next)}
                  onSaved={() => void load()}
                />
              ))}
              <p className="text-muted-foreground pt-1 text-xs">
                Gateways come from the registry in{' '}
                <code className="font-mono">src/lib/payments/registry.ts</code> — adding one there
                makes it appear here automatically.
              </p>
            </>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <PaymentRequestsTable onPendingCountChange={setPendingCount} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
