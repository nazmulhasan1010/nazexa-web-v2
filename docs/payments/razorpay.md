# Razorpay

**Documentation status:** Officially documented

India cards/UPI/netbanking. Orders (paise) + payment links; HMAC payment + webhook signatures.

## Endpoints (`gatewayEndpoints.razorpay`)

| Env | Base |
| --- | --- |
| Sandbox / Production | `https://api.razorpay.com` |

| Path | Purpose |
| --- | --- |
| `/v1/orders` | Create / GET order |
| `/v1/payments` | Payment retrieve |
| `/v1/payments/{id}/refund` | Refund |
| `/v1/payment_links` | Hosted redirect URL (used by adapter) |

## Config

- Required: `keyId`, `keySecret`
- Optional: `webhookSecret`
- `environment`: `sandbox` | `production`

## Behavior

- **Create:** Order + payment link (`short_url`).
- **Verify:** Optional callback HMAC `orderId|paymentId`; then GET payment/order; amount/currency checks.
- **Webhook:** `X-Razorpay-Signature` over raw body; events like `payment.captured`.
- **Refund:** Yes.

Adapter: `src/lib/payments/adapters/razorpay.ts`.
