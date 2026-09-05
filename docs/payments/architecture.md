# Payment architecture

Nazexa Web is the **central payment authority** for the ecosystem. Products create transactions via S2S; users pay on Nazexa checkout; only Nazexa marks `PAID` after gateway verification.

## Flow

```
Product (S2S)                    Nazexa Web                         Gateway
     |                                |                                 |
     | POST /api/payments/create      |                                 |
     |  client_id + secret            |                                 |
     |  userId, product, planId,      |                                 |
     |  currency (amount ignored)     |                                 |
     |------------------------------->| resolve PaymentProductPlan      |
     |                                | create PaymentTransaction       |
     |  { checkoutUrl, publicId }     |                                 |
     |<-------------------------------|                                 |
     | redirect user to checkout      |                                 |
     |                                | user selects gateway            |
     |                                | adapter.createPayment()         |
     |                                |-------------------------------->|
     |                                |  redirectUrl / manual proof     |
     |                                |<--------------------------------|
     |                                | browser → gateway hosted page   |
     |                                |                                 |
     |                    callback ≠ paid                               |
     |  GET/POST /api/payments/callback/[gateway]/[outcome]            |
     |                                | adapter.verifyPayment()         |
     |                                |-------------------------------->|
     |                                | mark PAID only if verified      |
     |                                | fulfill → product webhook       |
     |                                |                                 |
     |              POST /api/payments/webhook/[gateway] (async)        |
     |                                | signature check + verify         |
     |                                | mark PAID + fulfill             |
```

## Layers

| Layer | Path | Role |
| --- | --- | --- |
| S2S create | `src/app/api/payments/create` | Authenticate app; ignore client amount |
| Orchestration | `src/lib/payments/orchestration.ts` | Amounts, gateway select, PAID, fulfillment |
| Adapters | `src/lib/payments/adapters/*` | Provider create / verify / refund / webhook |
| Endpoints | `src/lib/payments/endpoints.ts` | Sandbox/prod base URLs + path helpers |
| Registry | `src/lib/payments/registry.ts` | Admin UI fields, capabilities, currencies |
| Secrets | `src/lib/payments/secrets.ts` | AES seal, sanitize, truncate |

## Invariants

1. **Never trust client amount** — `amount` / `price` in create body are ignored; amount comes from `PaymentProductPlan` (or trusted internal fallback only).
2. **Callback ≠ paid** — browser return to `/api/payments/callback/...` never marks `PAID` alone; always `adapter.verifyPayment()` (or later webhook + verify).
3. **Products never self-mark paid** — fulfillment is a Nazexa → product webhook after `PAID`.
4. **Manual gateways never auto-verify** — `bank_transfer`, `rocket`, and default `upay` stay `PENDING_REVIEW` until admin approval.
5. **Secrets stay server-side** — encrypted at rest; never sent to checkout UI.

## Adapter contract

Each gateway implements `PaymentGatewayAdapter` (`src/lib/payments/types.ts`):

- `validateConfig` / `createPayment` / `verifyPayment` / `getPaymentStatus`
- Optional: `refundPayment`, `handleWebhook`, `testConnection`

Shared helpers (`adapters/base.ts`): `amountsMatch`, `currenciesMatch`, `toMinorUnits`, `jsonFetch`, `safeSummary`, `requireFields`.

## Status model

`CREATED` → `INITIATED` / `PENDING` / `REQUIRES_ACTION` → (`PROCESSING` | `PENDING_REVIEW`) → `PAID` | `FAILED` | `CANCELLED` | `EXPIRED` → optional `REFUNDED`.

Terminal paid set: `PAID`, `REFUNDED`, `PARTIALLY_REFUNDED`.
