# ShurjoPay

**Documentation status:** Officially documented

ShurjoMukhi gateway: get_token → secret-pay → verification.

## Endpoints (`gatewayEndpoints.shurjopay`)

| Env        | Base                                |
| ---------- | ----------------------------------- |
| Sandbox    | `https://sandbox.shurjopayment.com` |
| Production | `https://engine.shurjopayment.com`  |

| Path                | Purpose                               |
| ------------------- | ------------------------------------- |
| `/api/get_token`    | Merchant token                        |
| `/api/secret-pay`   | Checkout (or URL from token response) |
| `/api/verification` | Verify payment                        |

## Config

- Required: `merchantUsername`, `merchantPassword`
- Optional: `prefix` (order id prefix)
- `environment`: `sandbox` | `production`

## Behavior

- **Create / redirect:** Yes.
- **Verify:** Verification API; amount/currency match.
- **Webhook / refund:** Not implemented.

Adapter: `src/lib/payments/adapters/shurjopay.ts`.
