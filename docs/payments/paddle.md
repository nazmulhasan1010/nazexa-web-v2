# Paddle

**Documentation status:** Officially documented

Merchant of record (VAT/tax). Billing API transactions + webhook signature.

## Endpoints (`gatewayEndpoints.paddle`)

| Env        | Base                             |
| ---------- | -------------------------------- |
| Sandbox    | `https://sandbox-api.paddle.com` |
| Production | `https://api.paddle.com`         |

| Path            | Purpose                      |
| --------------- | ---------------------------- |
| `/transactions` | Create / manage transactions |

## Config

- Required: `apiKey`
- Optional: `vendorId`, `priceId`, `webhookSecret`
- `environment`: `sandbox` | `production`

## Behavior

- **Create:** POST transaction (catalog `priceId` or ad-hoc `unit_price`); redirect to checkout URL.
- **Webhook:** `Paddle-Signature` (`ts` + `h1` HMAC).
- **Verify / refund:** Supported in adapter.

Adapter: `src/lib/payments/adapters/paddle.ts`.
