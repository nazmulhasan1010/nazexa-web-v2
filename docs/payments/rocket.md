# Rocket

**Documentation status:** Manual

Dutch-Bangla Bank mobile banking. No public checkout API is invented.

## Endpoints

`gatewayEndpoints.rocket`: sandbox/production `null`, `documentationStatus: 'manual'`.

## Config (public)

- Required: `merchantNumber`, `accountType`
- Optional: `accountName`

## User submission

- `senderNumber`, `transactionId` (TrxID)

## Behavior

- **Create:** Manual instructions + `requiresManualProof: true`.
- **Verify:** Never auto-paid (`PENDING_REVIEW`).
- **Webhook / refund:** None.

Adapter: `src/lib/payments/adapters/rocket.ts`.
