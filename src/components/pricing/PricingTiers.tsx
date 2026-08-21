"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/Reveal";
import { useCurrency } from "@/hooks/use-currency";
import { formatPrice } from "@/lib/currency";
import { CurrencySwitcher } from "./CurrencySwitcher";

export interface PricingTierData {
  id?: string;
  name: string;
  price: string | number;
  cadence?: string;
  body: string;
  features: string[];
  highlight?: boolean;
}

export function PricingTiers({ tiers }: { tiers: PricingTierData[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const {
    currency,
    setCurrency,
    clearOverride,
    country,
    isDetecting,
    isManual,
  } = useCurrency();

  const handlePurchase = async (planId?: string) => {
    if (!planId) {
      router.push("/contact");
      return;
    }

    setLoadingId(planId);
    try {
      const res = await fetch("/api/products/nazexa-db/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (res.status === 401) {
        // Not logged in -> redirect to login, preserving intent
        router.push(`/login?callbackUrl=${encodeURIComponent("/pricing")}`);
        return;
      }

      if (!res.ok) {
        alert(data.error || "Failed to process purchase");
        setLoadingId(null);
        return;
      }

      if (data.data?.status === "checkout_required") {
        const dbUrl = process.env.NEXT_PUBLIC_NAZEXA_DB_URL || "http://localhost:8000";
        window.location.href = `${dbUrl}${data.data.checkoutUrl}`;
      } else if (data.data?.status === "active") {
        const dbUrl = process.env.NEXT_PUBLIC_NAZEXA_DB_URL || "http://localhost:8000";
        window.location.href = `${dbUrl}/account`;
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CurrencySwitcher
          currency={currency}
          onChange={setCurrency}
          onReset={clearOverride}
          isDetecting={isDetecting}
          isManual={isManual}
          country={country}
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {tiers.map((tier, j) => (
          <Reveal key={tier.name} variant="up" delay={j * 90}>
            <div
              className={`surface-card flex h-full flex-col p-7 ${tier.highlight ? "glow-ring ring-1 ring-primary/40" : ""}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                {tier.highlight ? (
                  <Badge className="bg-primary/15 text-primary">
                    Most popular
                  </Badge>
                ) : null}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-gradient font-display text-4xl font-semibold">
                  {typeof tier.price === "number"
                    ? formatPrice(tier.price, currency)
                    : tier.price}
                </span>
                {tier.cadence ? (
                  <span className="text-xs text-muted-foreground">
                    /{tier.cadence}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{tier.body}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((ft) => (
                  <li
                    key={ft}
                    className="flex gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{ft}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handlePurchase(tier.id)}
                disabled={loadingId === tier.id}
                className="mt-7"
                variant={tier.highlight ? "default" : "outline"}
              >
                {loadingId === tier.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : typeof tier.price === "number" && tier.price === 0 ? (
                  "Get started"
                ) : tier.id ? (
                  "Purchase / Subscribe"
                ) : (
                  "Contact sales"
                )}
              </Button>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
