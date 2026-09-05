# aamarPay

**Documentation status:** Officially documented

Bangladeshi aggregator — JSON initiate + search verification.

## Endpoints (`gatewayEndpoints.aamarpay`)

| Env | Base |
| --- | --- |
| Sandbox | `https://sandbox.aamarpay.com` |
| Production | `https://secure.aamarpay.com` |

| Path | Purpose |
| --- | --- |
| `/jsonpost.php` | Create payment → `payment_url` |
| `/api/v1/trxcheck/request.php` | Verify by `request_id` |

## Config

- `storeId` (required)
- `signatureKey` (required, secret)
- `environment`: `sandbox` | `production`

## Behavior

- **Create:** POST JSON with amount, `tran_id` = Nazexa `publicId`, success/fail/cancel URLs.
- **Redirect:** Yes (`payment_url`).
- **Webhook:** No dedicated IPN adapter.
- **Verify:** Search API; paid if status successful / `status_code === 2`; amount/currency checked.
- **Refund:** Not implemented.

Adapter: `src/lib/payments/adapters/aamarpay.ts`.
