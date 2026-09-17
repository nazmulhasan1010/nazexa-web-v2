# Nagad

**Documentation status:** Verify (confirm crypto & URLs before production)

DFS checkout. Endpoints and RSA placeholder flow exist; merchant docs must confirm before live.

## Endpoints (`gatewayEndpoints.nagad`)

`documentationStatus: 'verify'`

| Env        | Base                                                           |
| ---------- | -------------------------------------------------------------- |
| Sandbox    | `https://sandbox.mynagad.com:10060/remote-payment-gateway-1.0` |
| Production | `https://api.mynagad.com/api/dfs`                              |

| Path                            | Purpose  |
| ------------------------------- | -------- |
| `/api/dfs/check-out/initialize` | Init     |
| `/api/dfs/check-out/complete`   | Complete |
| `/api/dfs/verify`               | Verify   |

Override with `apiBaseUrl` when merchant docs differ.

## Config

- Required: `merchantId`, `merchantPrivateKey` (PEM), `nagadPublicKey` (PEM)
- Optional: `merchantNumber`, `apiBaseUrl`
- `environment`: `sandbox` | `production`

## Behavior

- **Create / redirect / verify:** Implemented structurally with RSA-SHA256 helpers — treat as **verify** until merchant validation.
- **Webhook / refund:** No.

Exported: `NAGAD_DOCUMENTATION_STATUS` from adapter.

Adapter: `src/lib/payments/adapters/nagad.ts`.
