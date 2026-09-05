# Bank transfer

**Documentation status:** Manual

Direct bank deposit / wire. No provider API.

## Endpoints

`gatewayEndpoints.bank_transfer`: sandbox/production `null`, `documentationStatus: 'manual'`.

## Config (public on checkout)

- Required: `bankName`, `accountName`, `accountNumber`
- Optional: `branch`, `routingNumber`, `swift`

## User submission

- `transactionId` (reference / slip) required
- `senderName` optional

## Behavior

- **Create:** Returns `requiresManualProof: true` + transfer instructions. Never redirects to a PSP.
- **Verify:** Always `paid: false`, `status: PENDING_REVIEW`. Admin must approve.
- **Webhook / refund:** None.

Adapter: `src/lib/payments/adapters/bank-transfer.ts`.
