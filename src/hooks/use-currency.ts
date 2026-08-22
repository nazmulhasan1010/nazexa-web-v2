'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { DEFAULT_CURRENCY, isCurrencyCode, type CurrencyCode } from '@/lib/currency';

const STORAGE_KEY = 'cmdc:currency';

/**
 * The manual currency choice lives in localStorage, which is an external store:
 * reading it through useSyncExternalStore keeps SSR output (always `null`) and
 * the client in sync without a cascading setState-in-effect on mount.
 */
const overrideStore = (() => {
  const listeners = new Set<() => void>();
  let snapshot: CurrencyCode | null = null;
  let loaded = false;

  function read(): CurrencyCode | null {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return isCurrencyCode(stored) ? stored : null;
    } catch {
      return null;
    }
  }

  function emit() {
    for (const listener of listeners) listener();
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key !== null && event.key !== STORAGE_KEY) return;
        loaded = false;
        snapshot = read();
        loaded = true;
        emit();
      };
      window.addEventListener('storage', onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', onStorage);
      };
    },
    getSnapshot(): CurrencyCode | null {
      if (!loaded) {
        snapshot = read();
        loaded = true;
      }
      return snapshot;
    },
    getServerSnapshot(): CurrencyCode | null {
      return null;
    },
    set(code: CurrencyCode) {
      snapshot = code;
      loaded = true;
      try {
        window.localStorage.setItem(STORAGE_KEY, code);
      } catch {
        // Private mode or storage disabled — the choice won't persist, but it
        // still applies for this session.
      }
      emit();
    },
    clear() {
      snapshot = null;
      loaded = true;
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore — re-detection still applies for this session.
      }
      emit();
    },
  };
})();

type DetectionStatus = 'pending' | 'done';

interface Detection {
  status: DetectionStatus;
  currency: CurrencyCode | null;
  country: string | null;
}

export interface UseCurrencyOptions {
  /**
   * Currency already resolved from the request IP on the server. When given,
   * it is used for the first paint and no client detection request is made —
   * this is what makes the local currency the actual default rather than a
   * post-hydration correction of USD.
   */
  initialCurrency?: CurrencyCode;
  initialCountry?: string | null;
}

export interface UseCurrencyResult {
  currency: CurrencyCode;
  /** Persists a manual choice; it wins over IP detection from then on. */
  setCurrency: (code: CurrencyCode) => void;
  /** Clears the manual choice and re-detects from IP. */
  clearOverride: () => void;
  /** ISO country behind the detected currency, when known. */
  country: string | null;
  /** True while the initial detection request is in flight. */
  isDetecting: boolean;
  /** True when the user picked the currency rather than IP detection. */
  isManual: boolean;
}

/**
 * Resolves the currency prices are displayed in.
 *
 * Precedence: a stored manual choice wins, then the server-resolved
 * `initialCurrency` from the request IP, then a client-side detect via
 * `/api/geo/currency` (only needed after `clearOverride`). An unsupported or
 * unresolvable country falls back to USD.
 */
export function useCurrency({
  initialCurrency,
  initialCountry,
}: UseCurrencyOptions = {}): UseCurrencyResult {
  const override = useSyncExternalStore(
    overrideStore.subscribe,
    overrideStore.getSnapshot,
    overrideStore.getServerSnapshot
  );

  const [detection, setDetection] = useState<Detection>(
    initialCurrency
      ? {
          status: 'done',
          currency: initialCurrency,
          country: initialCountry ?? null,
        }
      : { status: 'pending', currency: null, country: null }
  );
  // Bumped by clearOverride to force a re-detect.
  const [detectNonce, setDetectNonce] = useState(0);

  const hasOverride = override !== null;

  useEffect(() => {
    // A manual choice makes detection pointless — skip the request entirely.
    if (hasOverride || detection.status === 'done') return;

    let cancelled = false;

    fetch('/api/geo/currency')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        setDetection({
          status: 'done',
          currency: isCurrencyCode(data?.currency) ? data.currency : null,
          country: typeof data?.country === 'string' ? data.country : null,
        });
      })
      .catch(() => {
        // Best-effort — fall back to the default currency.
        if (!cancelled) setDetection({ status: 'done', currency: null, country: null });
      });

    return () => {
      cancelled = true;
    };
  }, [hasOverride, detectNonce, detection.status]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    overrideStore.set(code);
  }, []);

  const clearOverride = useCallback(() => {
    overrideStore.clear();
    setDetection({ status: 'pending', currency: null, country: null });
    setDetectNonce((n) => n + 1);
  }, []);

  return {
    currency: override ?? detection.currency ?? DEFAULT_CURRENCY,
    setCurrency,
    clearOverride,
    country: detection.country,
    isDetecting: !hasOverride && detection.status === 'pending',
    isManual: hasOverride,
  };
}
