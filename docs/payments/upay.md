# Upay

**Documentation status:** Merchant-specific

Bangladesh MFS (UCB). Default is manual Send Money proof. Automated checkout only if merchant docs supply a fixed HTTPS `apiBaseUrl`.

## Endpoints

`gatewayEndpoints.upay`: sandbox/production `null`, `documentationStatus: 'merchant-specific'`.

Do **not** invent Upay URLs — set `apiBaseUrl` from merchant documentation only.

## Config

- Manual (required): `merchantNumber`, `accountType`; optional `accountName`
- Optional API: `apiBaseUrl`, `merchantId`, `apiKey`, `apiSecret`

## Behavior

- Without HTTPS `apiBaseUrl`: `requiresManualProof: true` (same pattern as Rocket).
- With `apiBaseUrl`: adapter may call merchant paths; still treat as merchant-specific.
- **Verify:** Does not auto-mark paid for pure manual mode.
- **Webhook / refund:** No.

Adapter: `src/lib/payments/adapters/upay.ts`.
