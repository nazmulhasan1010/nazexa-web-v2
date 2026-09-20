'use client';

import { useState } from 'react';
import type { AvailableGateway } from '@/lib/payments/server';

interface Txn {
  id: string;
  publicId: string;
  status: string;
  product: string;
  plan: string;
  amount: string;
  currency: string;
}

export default function CheckoutClient({
  transaction,
  gateways,
}: {
  transaction: Txn;
  gateways: AvailableGateway[];
}) {
  const [selectedGateway, setSelectedGateway] = useState<AvailableGateway | null>(null);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'select' | 'pay' | 'submitted'>('select');
  const [instructions, setInstructions] = useState<string | null>(null);

  // Custom Payment Method
  const [customMethod, setCustomMethod] = useState<'bkash' | 'nagad' | 'bank_transfer' | null>(
    null
  );
  const [showCustomInstructions, setShowCustomInstructions] = useState(false);

  const terminal = [
    'PAID',
    'FAILED',
    'CANCELLED',
    'EXPIRED',
    'REFUNDED',
    'PENDING_REVIEW',
    'approved',
    'rejected',
  ];
  if (terminal.includes(transaction.status) || phase === 'submitted') {
    return (
      <div className="space-y-3 p-4 text-center">
        <p className="text-foreground font-medium">
          {transaction.status === 'PAID' || transaction.status === 'approved'
            ? 'Payment confirmed.'
            : transaction.status === 'PENDING_REVIEW' || phase === 'submitted'
              ? 'Payment submitted for review. You will be notified once verified.'
              : `This transaction is ${transaction.status}.`}
        </p>
        <p className="text-muted-foreground font-mono text-xs">{transaction.publicId}</p>
        <p className="text-muted-foreground text-sm">
          Do not close this page and assume payment succeeded based on a redirect alone - activation
          happens only after server verification.
        </p>
      </div>
    );
  }

  const handleInitiate = async (gw: AvailableGateway) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.id,
          gatewayId: gw.id,
          action: 'initiate',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate payment');

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      setSelectedGateway(gw);
      setInstructions(data.instructions || gw.instructions);
      setPhase('pay');
      if (!data.requiresManualProof && gw.checkout === 'redirect') {
        throw new Error('Gateway did not return a checkout URL');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGateway) return;
    setLoading(true);
    setError(null);

    const submissionDetails = { ...details };
    if (selectedGateway.code === 'custom_payment' && customMethod) {
      submissionDetails.customPaymentType = customMethod;
    }

    try {
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.id,
          gatewayId: selectedGateway.id,
          action: 'submit_proof',
          details: submissionDetails,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit payment');

      if (data.autoApproved || data.transaction?.status === 'PAID') {
        window.location.href = `/checkout/status/${transaction.publicId}`;
        return;
      }

      setPhase('submitted');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'select' || !selectedGateway) {
    // Filter gateways that are custom_payment but have no enabled methods
    const visibleGateways = gateways.filter((gw) => {
      if (gw.code === 'custom_payment') {
        const hasBkash = gw.details.bkashEnabled === 'true';
        const hasNagad = gw.details.nagadEnabled === 'true';
        const hasBank = gw.details.bankEnabled === 'true';
        return hasBkash || hasNagad || hasBank;
      }
      return true;
    });

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-foreground text-2xl font-semibold tracking-tight">Payment Method</h3>
          <p className="text-muted-foreground mt-1 text-sm">Select how you would like to pay.</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg border p-4 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {visibleGateways.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <svg
                className="text-muted-foreground mb-3 h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-muted-foreground text-sm font-medium">
                No payment methods available for this currency.
              </p>
            </div>
          )}
          {visibleGateways.map((gw) => {
            if (gw.code === 'custom_payment') {
              const hasBkash = gw.details.bkashEnabled === 'true';
              const hasNagad = gw.details.nagadEnabled === 'true';
              const hasBank = gw.details.bankEnabled === 'true';

              return (
                <button
                  key={gw.id}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setCustomMethod(null);
                    void handleInitiate(gw);
                  }}
                  className="group bg-card hover:border-primary focus:border-primary focus:ring-primary relative flex w-full flex-col overflow-hidden rounded-xl border p-5 text-left shadow-sm transition-all hover:shadow-md focus:ring-1 focus:outline-none disabled:opacity-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-foreground block font-semibold">Manual Payment</span>
                      <span className="text-muted-foreground mt-0.5 block text-xs">
                        Mobile Banking & Bank Transfer
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 sm:mt-0">
                    {hasBkash && (
                      <span className="flex h-8 items-center rounded bg-[#e2136e]/10 px-2.5 text-[11px] font-bold tracking-wide text-[#e2136e]">
                        bKash
                      </span>
                    )}
                    {hasNagad && (
                      <span className="flex h-8 items-center rounded bg-[#f37021]/10 px-2.5 text-[11px] font-bold tracking-wide text-[#f37021]">
                        Nagad
                      </span>
                    )}
                    {hasBank && (
                      <span className="flex h-8 items-center rounded bg-blue-600/10 px-2.5 text-[11px] font-bold tracking-wide text-blue-600">
                        Bank
                      </span>
                    )}
                    <svg
                      className="text-muted-foreground group-hover:text-primary ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={gw.id}
                type="button"
                disabled={loading}
                onClick={() => {
                  setCustomMethod(null);
                  void handleInitiate(gw);
                }}
                className="group bg-card hover:border-primary focus:border-primary focus:ring-primary flex w-full items-center justify-between rounded-xl border p-5 text-left shadow-sm transition-all hover:shadow-md focus:ring-1 focus:outline-none disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-muted text-muted-foreground flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                    <span className="text-xs font-bold uppercase">{gw.name.slice(0, 2)}</span>
                  </div>
                  <div>
                    <span className="text-foreground block font-semibold">{gw.name}</span>
                    <span className="text-muted-foreground mt-0.5 block text-xs">
                      {gw.checkout === 'redirect' ? 'Secure hosted checkout' : 'Manual transfer'}
                    </span>
                  </div>
                </div>
                <svg
                  className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Render logic for Custom Payment
  if (selectedGateway?.code === 'custom_payment') {
    const hasBkash = selectedGateway.details.bkashEnabled === 'true';
    const hasNagad = selectedGateway.details.nagadEnabled === 'true';
    const hasBank = selectedGateway.details.bankEnabled === 'true';

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              if (showCustomInstructions) {
                setShowCustomInstructions(false);
              } else {
                setSelectedGateway(null);
                setPhase('select');
                setDetails({});
                setCustomMethod(null);
              }
            }}
            className="text-muted-foreground hover:text-foreground flex items-center text-sm font-medium transition-colors"
          >
            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
        </div>

        <div>
          <h3 className="text-foreground text-2xl font-semibold tracking-tight">
            {showCustomInstructions ? 'Complete Your Payment' : 'Select Payment Option'}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {showCustomInstructions
              ? 'Follow the instructions below to complete your transaction.'
              : 'Choose your preferred manual payment method to proceed.'}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg border p-4 text-sm font-medium">
            {error}
          </div>
        )}

        {!showCustomInstructions ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {hasBkash && (
                <label
                  className={`hover:bg-muted/30 relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 p-6 transition-all duration-200 ${customMethod === 'bkash' ? 'border-[#e2136e] bg-gradient-to-b from-[#e2136e]/10 to-transparent shadow-[0_0_20px_rgba(226,19,110,0.15)] ring-1 ring-[#e2136e]/20' : 'border-border/60 hover:border-border'}`}
                >
                  <input
                    type="radio"
                    name="customMethod"
                    value="bkash"
                    checked={customMethod === 'bkash'}
                    onChange={() => setCustomMethod('bkash')}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors ${customMethod === 'bkash' ? 'bg-[#e2136e] text-white shadow-lg shadow-[#e2136e]/30' : 'bg-muted text-muted-foreground'}`}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <span
                    className={`text-lg font-semibold tracking-wide ${customMethod === 'bkash' ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    bKash
                  </span>
                  {customMethod === 'bkash' && (
                    <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#e2136e] text-white shadow-sm">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </label>
              )}
              {hasNagad && (
                <label
                  className={`hover:bg-muted/30 relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 p-6 transition-all duration-200 ${customMethod === 'nagad' ? 'border-[#f37021] bg-gradient-to-b from-[#f37021]/10 to-transparent shadow-[0_0_20px_rgba(243,112,33,0.15)] ring-1 ring-[#f37021]/20' : 'border-border/60 hover:border-border'}`}
                >
                  <input
                    type="radio"
                    name="customMethod"
                    value="nagad"
                    checked={customMethod === 'nagad'}
                    onChange={() => setCustomMethod('nagad')}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors ${customMethod === 'nagad' ? 'bg-[#f37021] text-white shadow-lg shadow-[#f37021]/30' : 'bg-muted text-muted-foreground'}`}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                  </div>
                  <span
                    className={`text-lg font-semibold tracking-wide ${customMethod === 'nagad' ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    Nagad
                  </span>
                  {customMethod === 'nagad' && (
                    <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#f37021] text-white shadow-sm">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </label>
              )}
              {hasBank && (
                <label
                  className={`hover:bg-muted/30 relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 p-6 transition-all duration-200 ${customMethod === 'bank_transfer' ? 'border-blue-600 bg-gradient-to-b from-blue-600/10 to-transparent shadow-[0_0_20px_rgba(37,99,235,0.15)] ring-1 ring-blue-600/20' : 'border-border/60 hover:border-border'}`}
                >
                  <input
                    type="radio"
                    name="customMethod"
                    value="bank_transfer"
                    checked={customMethod === 'bank_transfer'}
                    onChange={() => setCustomMethod('bank_transfer')}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors ${customMethod === 'bank_transfer' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-muted text-muted-foreground'}`}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <span
                    className={`text-lg font-semibold tracking-wide ${customMethod === 'bank_transfer' ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    Bank
                  </span>
                  {customMethod === 'bank_transfer' && (
                    <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </label>
              )}
            </div>

            <button
              type="button"
              disabled={!customMethod}
              onClick={() => setShowCustomInstructions(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/50 shadow-primary/25 relative mt-8 inline-flex h-12 w-full items-center justify-center overflow-hidden rounded-xl text-base font-semibold shadow-lg transition-all focus-visible:ring-4 focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 border-border/60 bg-card ring-border/5 overflow-hidden rounded-2xl border shadow-sm ring-1 duration-300">
            <div className="border-border/50 bg-muted/20 relative overflow-hidden border-b p-6 sm:p-8">
              {/* Decorative background element */}
              <div
                className={`absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-20 blur-3xl ${customMethod === 'bkash' ? 'bg-[#e2136e]' : customMethod === 'nagad' ? 'bg-[#f37021]' : 'bg-blue-600'}`}
              ></div>

              {customMethod === 'bkash' && (
                <div className="relative">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e2136e]/10 text-[#e2136e]">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold tracking-tight">bKash Payment Steps</h4>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedGateway.details.bkashInstructions ||
                      'Please send the exact amount to the following bKash number.'}
                  </p>

                  {selectedGateway.details.bkashNumber && (
                    <div className="mt-5 flex flex-col justify-between rounded-xl border border-[#e2136e]/20 bg-gradient-to-r from-[#e2136e]/5 to-transparent p-4 shadow-inner sm:flex-row sm:items-center sm:p-5">
                      <span className="text-foreground/80 mb-1 text-sm font-medium sm:mb-0">
                        Merchant bKash Number
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold tracking-wider text-[#e2136e] drop-shadow-sm">
                          {selectedGateway.details.bkashNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(selectedGateway.details.bkashNumber!)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-[#e2136e]/10 text-[#e2136e] transition-colors hover:bg-[#e2136e] hover:text-white"
                          title="Copy to clipboard"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {customMethod === 'nagad' && (
                <div className="relative">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f37021]/10 text-[#f37021]">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold tracking-tight">Nagad Payment Steps</h4>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedGateway.details.nagadInstructions ||
                      'Please send the exact amount to the following Nagad number.'}
                  </p>

                  {selectedGateway.details.nagadNumber && (
                    <div className="mt-5 flex flex-col justify-between rounded-xl border border-[#f37021]/20 bg-gradient-to-r from-[#f37021]/5 to-transparent p-4 shadow-inner sm:flex-row sm:items-center sm:p-5">
                      <span className="text-foreground/80 mb-1 text-sm font-medium sm:mb-0">
                        Merchant Nagad Number
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold tracking-wider text-[#f37021] drop-shadow-sm">
                          {selectedGateway.details.nagadNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(selectedGateway.details.nagadNumber!)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f37021]/10 text-[#f37021] transition-colors hover:bg-[#f37021] hover:text-white"
                          title="Copy to clipboard"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {customMethod === 'bank_transfer' && (
                <div className="relative">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold tracking-tight">Bank Transfer Steps</h4>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedGateway.details.bankInstructions ||
                      'Please transfer the exact amount to the bank account below.'}
                  </p>

                  <div className="border-border/60 bg-background/50 mt-5 overflow-hidden rounded-xl border shadow-sm backdrop-blur-sm">
                    {selectedGateway.details.bankName && (
                      <div className="border-border/40 hover:bg-muted/30 flex flex-col justify-between border-b p-3.5 px-5 text-sm transition-colors sm:flex-row sm:items-center">
                        <span className="text-muted-foreground mb-1 font-medium sm:mb-0">
                          Bank Name
                        </span>
                        <span className="text-foreground font-semibold">
                          {selectedGateway.details.bankName}
                        </span>
                      </div>
                    )}
                    {selectedGateway.details.bankAccountName && (
                      <div className="border-border/40 hover:bg-muted/30 flex flex-col justify-between border-b p-3.5 px-5 text-sm transition-colors sm:flex-row sm:items-center">
                        <span className="text-muted-foreground mb-1 font-medium sm:mb-0">
                          Account Name
                        </span>
                        <span className="text-foreground font-semibold">
                          {selectedGateway.details.bankAccountName}
                        </span>
                      </div>
                    )}
                    {selectedGateway.details.bankAccountNumber && (
                      <div className="flex flex-col justify-between border-b border-blue-600/20 bg-blue-50/40 p-3.5 px-5 text-sm sm:flex-row sm:items-center dark:bg-blue-900/10">
                        <span className="mb-1 font-medium text-blue-700 sm:mb-0 dark:text-blue-400">
                          Account Number
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-bold text-blue-700 dark:text-blue-400">
                            {selectedGateway.details.bankAccountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                selectedGateway.details.bankAccountNumber!
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded bg-blue-600/10 text-blue-700 transition-colors hover:bg-blue-600 hover:text-white dark:text-blue-400"
                            title="Copy Account Number"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedGateway.details.bankBranch && (
                      <div className="border-border/40 hover:bg-muted/30 flex flex-col justify-between border-b p-3.5 px-5 text-sm transition-colors sm:flex-row sm:items-center">
                        <span className="text-muted-foreground mb-1 font-medium sm:mb-0">
                          Branch
                        </span>
                        <span className="text-foreground font-medium">
                          {selectedGateway.details.bankBranch}
                        </span>
                      </div>
                    )}
                    {selectedGateway.details.bankRoutingNumber && (
                      <div className="hover:bg-muted/30 flex flex-col justify-between p-3.5 px-5 text-sm transition-colors sm:flex-row sm:items-center">
                        <span className="text-muted-foreground mb-1 font-medium sm:mb-0">
                          Routing Number
                        </span>
                        <span className="font-mono font-medium">
                          {selectedGateway.details.bankRoutingNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-5">
                <h4 className="text-lg font-semibold tracking-tight">Submit Proof</h4>
                <p className="text-muted-foreground text-sm">
                  After completing the transfer, please provide your transaction details below.
                </p>
              </div>
              <form onSubmit={handleSubmitProof} className="space-y-5">
                {selectedGateway.submissionFields
                  .filter((f) => f.key !== 'customPaymentType')
                  .map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-foreground flex items-center text-sm font-medium">
                        {field.label}
                        {field.required && (
                          <span className="bg-destructive ml-1.5 flex h-1.5 w-1.5 rounded-full"></span>
                        )}
                      </label>
                      <input
                        type={field.type === 'email' ? 'email' : 'text'}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="border-input bg-background/50 placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/20 flex h-12 w-full rounded-xl border px-4 py-2 text-sm transition-all focus-visible:ring-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        value={details[field.key] || ''}
                        onChange={(e) => setDetails({ ...details, [field.key]: e.target.value })}
                      />
                      {field.help && (
                        <p className="text-muted-foreground/80 pl-1 text-xs">{field.help}</p>
                      )}
                    </div>
                  ))}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/50 shadow-primary/25 relative mt-8 inline-flex h-12 w-full items-center justify-center overflow-hidden rounded-xl text-base font-semibold shadow-lg transition-all focus-visible:ring-4 focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Confirm Payment'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Regular gateway fallback
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => {
            setSelectedGateway(null);
            setPhase('select');
            setDetails({});
          }}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          &larr; Back
        </button>
        <h3 className="text-lg font-medium">{selectedGateway.name}</h3>
      </div>

      {(instructions || selectedGateway.instructions) && (
        <div className="bg-muted text-muted-foreground rounded p-4 text-sm whitespace-pre-wrap">
          {instructions || selectedGateway.instructions}
        </div>
      )}

      {Object.keys(selectedGateway.details).length > 0 && (
        <div className="space-y-1 rounded border p-3 text-sm">
          {Object.entries(selectedGateway.details).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-mono">{v}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive rounded p-3 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitProof} className="space-y-4">
        {selectedGateway.submissionFields.map((field) => (
          <div key={field.key}>
            <label className="text-foreground mb-1 block text-sm font-medium">
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <input
              type={field.type === 'email' ? 'email' : 'text'}
              required={field.required}
              placeholder={field.placeholder}
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={details[field.key] || ''}
              onChange={(e) => setDetails({ ...details, [field.key]: e.target.value })}
            />
            {field.help && <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>}
          </div>
        ))}

        <button
          type="submit"
          disabled={loading || selectedGateway.submissionFields.length === 0}
          className="w-full rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit payment proof'}
        </button>
      </form>
    </div>
  );
}
