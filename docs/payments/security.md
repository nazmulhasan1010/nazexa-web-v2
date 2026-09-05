# Payment security

## IDOR / authorization

- Checkout and status are keyed by opaque `publicId` (UUID), not sequential DB ids alone.
- S2S create requires `client_id` + `client_secret` for an **active** `Application` (`authenticateApplication`).
- Admin payment APIs use admin auth separately — never reuse product client secrets for admin.
- Products must only create payments for users they already authenticated; Nazexa checks `userId` exists and is `active`.

## Amount integrity

- Client-supplied `amount` / `price` on `POST /api/payments/create` are **ignored**.
- Authoritative amount: `PaymentProductPlan` for `(product, planId, currency)`.
- On verify/webhook, adapters compare gateway amount/currency to the stored transaction (`amountsMatch` / `currenciesMatch`). Mismatch → not paid.

## Secrets

- Gateway secret fields sealed with AES-256-GCM when `PAYMENT_ENCRYPTION_KEY` is set (`src/lib/payments/secrets.ts`).
- `sanitizeForStorage` / `safeSummary` redact keys matching `secret|password|token|authorization|…` before DB/logs.
- `truncatePayload` caps stored webhook/callback blobs (default 32KB).
- Never log raw `client_secret`, Stripe `sk_`, webhook secrets, or RSA private keys.

## Redirect allowlisting

- `success_url` / `cancel_url` must pass `isAllowlistedUrl(url, application.allowedOrigins)`.
- Origin must match an entry in the app’s comma-separated `allowedOrigins`.
- After payment, `resolveSafeReturnUrl` only redirects to allowlisted URLs; otherwise falls back to Nazexa `/checkout/status/{publicId}`.

## Webhooks

- Route: `POST /api/payments/webhook/[gateway]` — only adapters with `handleWebhook`.
- Verify provider signatures when configured (Stripe, Razorpay, Paddle; SSLCommerz validates via val_id).
- Deduplicate via `PaymentWebhookEvent` unique `(gateway, eventId)`.
- `paid: true` from webhook still goes through `markTransactionPaid` with amount checks where provided.

## Callback ≠ paid

- Browser hits on `/api/payments/callback/[gateway]/[outcome]` are untrusted UX signals.
- Success path always calls `verifyPayment` before `PAID`.
- Fail/cancel may update local status but never invent a paid state.

## PCI / card data

- Nazexa does **not** collect or store PAN/CVV. Card entry happens on gateway-hosted pages (Stripe Checkout, SSLCommerz, etc.).
- Prefer redirect / hosted checkout; do not add card fields to Nazexa UI.
- Store only gateway order/payment ids and sanitized summaries.

## Rate limits

- Create endpoint is rate-limited per IP (`rateLimit`). Treat abuse of webhooks/callbacks similarly in ops (WAF / gateway IP allowlists where available).
