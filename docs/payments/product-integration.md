# Product integration (S2S)

Satellite products (e.g. nazexa-db, nazexa-socket) create checkouts against Nazexa Web; they never mark themselves paid.

## Auth

```http
POST /api/payments/create
Content-Type: application/json
```

Authenticate with Application credentials registered in Nazexa:

| Field           | Required          | Notes                                       |
| --------------- | ----------------- | ------------------------------------------- |
| `client_id`     | Yes               | `applications.clientId`                     |
| `client_secret` | Yes               | Shared secret                               |
| Scope           | `payments:create` | Reserved; active apps may call create today |

Also reserved: `payments:read`, `payments:status` for future read APIs.

## Request body

```json
{
  "client_id": "nazexa-db",
  "client_secret": "…",
  "userId": "<central user uuid>",
  "product": "nazexa-db",
  "planId": "pro-monthly",
  "currency": "USD",
  "clientRequestId": "optional-idempotency-key",
  "success_url": "https://product.example/billing/done",
  "cancel_url": "https://product.example/billing/cancel",
  "metadata": { "seatCount": "5" },
  "productId": "optional-local-ref"
}
```

**Ignored if present:** `amount`, `price`, `gateway` — amounts come from `PaymentProductPlan`.

`success_url` / `cancel_url` must be allowlisted on the Application’s `allowedOrigins`.

## Success response

```json
{
  "checkoutUrl": "https://nazexa.example/checkout/{publicId}",
  "transactionId": "…",
  "publicId": "…",
  "status": "CREATED",
  "amount": "29.00",
  "currency": "USD",
  "reused": false
}
```

Redirect the user to `checkoutUrl`. Idempotent reuse when the same `clientRequestId` is sent again (`reused: true`).

## No gateway available

```json
{ "redirectUrl": "https://nazexa…/contact?reason=no-gateway&…", "code": "NO_GATEWAY" }
```

## Fulfillment webhook (Nazexa → product)

Configure `Application.paymentWebhookUrl`. After Nazexa marks the transaction `PAID`:

```http
POST {paymentWebhookUrl}
Content-Type: application/json
x-client-id: {clientId}
x-nazexa-event: payment.paid
x-nazexa-transaction: {publicId}
```

```json
{
  "event": "payment.paid",
  "transactionId": "…",
  "publicId": "…",
  "userId": "…",
  "planId": "…",
  "status": "PAID",
  "product": "…",
  "amount": "29.00",
  "currency": "USD"
}
```

On non-2xx or network error, fulfillment status becomes `FAILED` (retry/ops). Missing webhook URL → `SKIPPED`.

## Product checklist

1. Register Application with `allowedOrigins` and optional `paymentWebhookUrl`.
2. Seed `PaymentProductPlan` rows for each sellable plan/currency.
3. Call create with central `userId` after SSO.
4. On `payment.paid`, grant entitlements using `publicId` / `userId` / `planId` — do not trust browser return alone.
5. Optionally poll Nazexa status APIs when added under `payments:status`.
