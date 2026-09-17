# Stripe

**Documentation status:** Officially documented

Checkout Sessions + webhook HMAC (`stripe-signature`).

## Endpoints (`gatewayEndpoints.stripe`)

| Env                  | Base                     |
| -------------------- | ------------------------ |
| Sandbox / Production | `https://api.stripe.com` |

| Path                    | Purpose                   |
| ----------------------- | ------------------------- |
| `/v1/checkout/sessions` | Create + retrieve session |
| `/v1/refunds`           | Refunds                   |

## Config

- `publishableKey`, `secretKey` (required)
- `webhookSecret` (optional but recommended)
- `environment`: `sandbox` | `production`

## Behavior

- **Create:** Checkout Session (`mode=payment`); metadata `transaction_id` = `publicId`.
- **Redirect:** Session `url`.
- **Webhook:** `checkout.session.completed` with `payment_status=paid`; verifies `t`/`v1` signature when secret set.
- **Verify:** Retrieve session; require `payment_status=paid` + amount/currency/metadata match.
- **Refund:** Via payment intent.

Nazexa never touches PAN — hosted Checkout only.

Adapter: `src/lib/payments/adapters/stripe.ts`.
