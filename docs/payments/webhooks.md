# Payment webhooks & callbacks

## Provider webhook

```
POST /api/payments/webhook/[gateway]
```

Implemented in `src/app/api/payments/webhook/[gateway]/route.ts`.

### Behavior

1. Resolve adapter; 404 if no `handleWebhook`.
2. Load enabled `PaymentGateway` row; unseal secrets.
3. `adapter.handleWebhook(req, config)` — signature + parse.
4. `recordWebhookEvent` (dedupe on `gateway` + `eventId`).
5. If `result.ok && result.paid`, find transaction by `transactionPublicId` / gateway ids → `markTransactionPaid` → product fulfillment.

### Gateways with `handleWebhook`

| Gateway | Signature / validation |
| --- | --- |
| `stripe` | `stripe-signature` (`t=…,v1=…`) + `webhookSecret` |
| `razorpay` | `X-Razorpay-Signature` HMAC-SHA256 of raw body |
| `paddle` | `Paddle-Signature` (`ts=…;h1=…`) |
| `sslcommerz` | IPN body; confirm via validation API (`val_id`) |

Register URLs via `paymentWebhookUrl(gateway)` → `{APP}/api/payments/webhook/{code}`.

## Browser callback

```
GET|POST /api/payments/callback/[gateway]/[outcome]
```

`outcome`: `success` | `fail` | `cancel`

Implemented in `src/app/api/payments/callback/[gateway]/[outcome]/route.ts`.

### Behavior

1. Map query/body params to a `PaymentTransaction` (`tran_id`, `session_id`, `token`, etc.).
2. **fail / cancel** — may set `FAILED` / `CANCELLED` if not already terminal paid/review; redirect allowlisted cancel URL.
3. **success** — call `verifyPayment` with stored amount/currency + `callbackParams`. Mark `PAID` only if `verification.ok && verification.paid`. Otherwise leave `PROCESSING` for async webhook.
4. Record a synthetic webhook event `callback.{outcome}`.
5. Redirect via `resolveSafeReturnUrl` (allowlisted product URL or Nazexa status page). Query adds `nazexa_transaction` + `status`.

### Critical rule

**A successful redirect is not payment confirmation.** Providers can forge or replay browser hits. Always verify server-to-server (or signed webhook) before entitlements.

## URL helpers

From `src/lib/payments/endpoints.ts`:

| Helper | Path |
| --- | --- |
| `paymentCallbackUrl(gw, outcome)` | `/api/payments/callback/{gw}/{outcome}` |
| `paymentWebhookUrl(gw)` | `/api/payments/webhook/{gw}` |
| `paymentReturnPage(publicId)` | `/checkout/{publicId}/return` |
