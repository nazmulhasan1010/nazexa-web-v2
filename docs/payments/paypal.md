# PayPal

**Documentation status:** Officially documented

Orders v2 with `CAPTURE` intent; capture on verify.

## Endpoints (`gatewayEndpoints.paypal`)

| Env        | Base                               |
| ---------- | ---------------------------------- |
| Sandbox    | `https://api-m.sandbox.paypal.com` |
| Production | `https://api-m.paypal.com`         |

| Path                                | Purpose                  |
| ----------------------------------- | ------------------------ |
| `/v1/oauth2/token`                  | Client-credentials token |
| `/v2/checkout/orders`               | Create / GET order       |
| `/v2/checkout/orders/{id}/capture`  | Capture                  |
| `/v2/payments/captures/{id}/refund` | Refund                   |

## Config

- Required: `clientId`, `clientSecret`
- Optional: `webhookId` (reserved for future signature verify)
- `environment`: `sandbox` | `production`

## Behavior

- **Create:** Order + approve link redirect.
- **Verify:** Capture (or GET if already captured); match amount, currency, `custom_id`/`reference_id` to `publicId`.
- **Refund:** Capture refund API.
- **Webhook:** Registry lists support; adapter does **not** yet implement `handleWebhook` — rely on callback verify.

Adapter: `src/lib/payments/adapters/paypal.ts`.
