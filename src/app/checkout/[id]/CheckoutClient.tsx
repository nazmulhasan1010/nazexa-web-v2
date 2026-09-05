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
  const [customMethod, setCustomMethod] = useState<'bkash' | 'nagad' | 'bank_transfer' | null>(null);

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
    const visibleGateways = gateways.filter(gw => {
      if (gw.code === 'custom_payment') {
        const hasBkash = gw.details.bkashEnabled === 'true';
        const hasNagad = gw.details.nagadEnabled === 'true';
        const hasBank = gw.details.bankEnabled === 'true';
        return hasBkash || hasNagad || hasBank;
      }
      return true;
    });

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Select Payment Method</h3>
        {error && (
          <div className="bg-destructive/10 text-destructive rounded p-3 text-sm font-medium">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 gap-3">
          {visibleGateways.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No payment methods available for this currency.
            </p>
          )}
          {visibleGateways.map((gw) => (
            <button
              key={gw.id}
              type="button"
              disabled={loading}
              onClick={() => {
                setCustomMethod(null);
                void handleInitiate(gw);
              }}
              className="flex w-full items-center justify-between rounded-md border p-4 text-left transition-all hover:border-blue-500 hover:ring-1 hover:ring-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            >
              <span>
                <span className="block font-medium">{gw.name}</span>
                <span className="text-muted-foreground text-xs">
                  {gw.checkout === 'redirect' ? 'Hosted checkout' : 'Manual transfer'}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Render logic for Custom Payment
  if (selectedGateway.code === 'custom_payment') {
    const hasBkash = selectedGateway.details.bkashEnabled === 'true';
    const hasNagad = selectedGateway.details.nagadEnabled === 'true';
    const hasBank = selectedGateway.details.bankEnabled === 'true';

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              setSelectedGateway(null);
              setPhase('select');
              setDetails({});
              setCustomMethod(null);
            }}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            &larr; Back
          </button>
          <h3 className="text-lg font-medium">{selectedGateway.name}</h3>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded p-3 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <label className="font-medium">Choose payment option:</label>
          <div className="grid gap-2">
            {hasBkash && (
              <label className="flex items-center space-x-3 rounded border p-3 cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="customMethod"
                  value="bkash"
                  checked={customMethod === 'bkash'}
                  onChange={() => setCustomMethod('bkash')}
                  className="h-4 w-4"
                />
                <span className="font-medium">bKash</span>
              </label>
            )}
            {hasNagad && (
              <label className="flex items-center space-x-3 rounded border p-3 cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="customMethod"
                  value="nagad"
                  checked={customMethod === 'nagad'}
                  onChange={() => setCustomMethod('nagad')}
                  className="h-4 w-4"
                />
                <span className="font-medium">Nagad</span>
              </label>
            )}
            {hasBank && (
              <label className="flex items-center space-x-3 rounded border p-3 cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="customMethod"
                  value="bank_transfer"
                  checked={customMethod === 'bank_transfer'}
                  onChange={() => setCustomMethod('bank_transfer')}
                  className="h-4 w-4"
                />
                <span className="font-medium">Bank Transfer</span>
              </label>
            )}
          </div>
        </div>

        {customMethod && (
          <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-top-4">
            {/* Instructions */}
            {customMethod === 'bkash' && (
              <>
                <div className="bg-muted text-muted-foreground rounded p-4 text-sm whitespace-pre-wrap">
                  {selectedGateway.details.bkashInstructions || 'Send payment via bKash.'}
                </div>
                {selectedGateway.details.bkashNumber && (
                  <div className="space-y-1 rounded border p-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">bKash Number</span>
                      <span className="font-mono">{selectedGateway.details.bkashNumber}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {customMethod === 'nagad' && (
              <>
                <div className="bg-muted text-muted-foreground rounded p-4 text-sm whitespace-pre-wrap">
                  {selectedGateway.details.nagadInstructions || 'Send payment via Nagad.'}
                </div>
                {selectedGateway.details.nagadNumber && (
                  <div className="space-y-1 rounded border p-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Nagad Number</span>
                      <span className="font-mono">{selectedGateway.details.nagadNumber}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {customMethod === 'bank_transfer' && (
              <>
                <div className="bg-muted text-muted-foreground rounded p-4 text-sm whitespace-pre-wrap">
                  {selectedGateway.details.bankInstructions || 'Transfer the exact amount.'}
                </div>
                <div className="space-y-1 rounded border p-3 text-sm">
                  {selectedGateway.details.bankName && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Bank Name</span>
                      <span className="font-mono">{selectedGateway.details.bankName}</span>
                    </div>
                  )}
                  {selectedGateway.details.accountName && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Account Name</span>
                      <span className="font-mono">{selectedGateway.details.accountName}</span>
                    </div>
                  )}
                  {selectedGateway.details.accountNumber && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Account Number</span>
                      <span className="font-mono">{selectedGateway.details.accountNumber}</span>
                    </div>
                  )}
                  {selectedGateway.details.branch && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Branch</span>
                      <span className="font-mono">{selectedGateway.details.branch}</span>
                    </div>
                  )}
                  {selectedGateway.details.routingNumber && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Routing Number</span>
                      <span className="font-mono">{selectedGateway.details.routingNumber}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <form onSubmit={handleSubmitProof} className="space-y-4">
              {selectedGateway.submissionFields
                .filter(f => f.key !== 'customPaymentType') // hide internal select
                .map((field) => (
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
                  {field.help && <p className="mt-1 text-xs text-gray-500">{field.help}</p>}
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit payment proof'}
              </button>
            </form>
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
            {field.help && <p className="mt-1 text-xs text-gray-500">{field.help}</p>}
          </div>
        ))}

        <button
          type="submit"
          disabled={loading || selectedGateway.submissionFields.length === 0}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit payment proof'}
        </button>
      </form>
    </div>
  );
}