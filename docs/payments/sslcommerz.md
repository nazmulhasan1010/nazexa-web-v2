# SSLCommerz

**Documentation status:** Officially documented

BD aggregator (cards, MFS, net banking). Session create + IPN validation.

## Endpoints (`gatewayEndpoints.sslcommerz`)

| Env | Base |
| --- | --- |
| Sandbox | `https://sandbox.sslcommerz.com` |
| Production | `https://securepay.sslcommerz.com` |

| Path | Purpose |
| --- | --- |
| `/gwprocess/v4/api.php` | Session / GatewayPageURL |
| `/validator/api/validationserverAPI.php` | Validate by `val_id` |

## Config

- Required: `storeId`, `storePassword`
- `sandbox`: `true` | `false` (legacy env flag)

## Behavior

- **Create:** Form-urlencoded session; redirect to `GatewayPageURL`.
- **Callback:** Gateway may POST to success/fail URLs (route accepts GET+POST).
- **Webhook / IPN:** `handleWebhook` + validation API.
- **Verify:** Amount/currency match required for paid.
- **Refund:** Not implemented.

Adapter: `src/lib/payments/adapters/sslcommerz.ts`.
