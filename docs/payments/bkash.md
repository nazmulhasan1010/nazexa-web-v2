# bKash

**Documentation status:** Officially documented

Tokenized Checkout: grant token → create → execute on return.

## Endpoints (`gatewayEndpoints.bkash`)

| Env        | Base                                           |
| ---------- | ---------------------------------------------- |
| Sandbox    | `https://tokenized.sandbox.bka.sh/v1.2.0-beta` |
| Production | `https://tokenized.pay.bka.sh/v1.2.0-beta`     |

| Path                                 | Purpose              |
| ------------------------------------ | -------------------- |
| `/tokenized/checkout/token/grant`    | OAuth-style grant    |
| `/tokenized/checkout/create`         | Create payment       |
| `/tokenized/checkout/execute`        | Execute after return |
| `/tokenized/checkout/payment/status` | Query status         |

Optional config `apiBaseUrl` overrides base if merchant docs require it.

## Config

- Required: `appKey`, `appSecret`, `username`, `password`
- `environment`: `sandbox` | `production`

## Behavior

- **Create / redirect:** Yes (bKash hosted URL).
- **Verify:** Execute/query; amount/currency checks.
- **Webhook / refund:** Not implemented in adapter.

Adapter: `src/lib/payments/adapters/bkash.ts`.
