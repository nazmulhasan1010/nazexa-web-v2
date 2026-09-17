# Gateway capability matrix

Source of truth for URLs: `src/lib/payments/endpoints.ts`. Capabilities: `src/lib/payments/registry.ts` + adapter implementations.

**Docs status legend:** Officially documented · Merchant-specific · Manual · Verify (confirm before production)

| Gateway         | Docs                  | Sandbox base                                                   | Production base                            | Create                          | Redirect | Webhook                                          | Verify                               | Refund |
| --------------- | --------------------- | -------------------------------------------------------------- | ------------------------------------------ | ------------------------------- | -------- | ------------------------------------------------ | ------------------------------------ | ------ |
| `aamarpay`      | Officially documented | `https://sandbox.aamarpay.com`                                 | `https://secure.aamarpay.com`              | Yes (`/jsonpost.php`)           | Yes      | No                                               | Yes (`/api/v1/trxcheck/request.php`) | No     |
| `sslcommerz`    | Officially documented | `https://sandbox.sslcommerz.com`                               | `https://securepay.sslcommerz.com`         | Yes (session)                   | Yes      | Yes (IPN)                                        | Yes (validation API)                 | No     |
| `stripe`        | Officially documented | `https://api.stripe.com`                                       | `https://api.stripe.com`                   | Yes (Checkout Session)          | Yes      | Yes (`stripe-signature`)                         | Yes (retrieve session)               | Yes    |
| `paypal`        | Officially documented | `https://api-m.sandbox.paypal.com`                             | `https://api-m.paypal.com`                 | Yes (Orders v2)                 | Yes      | Registry yes; adapter has no `handleWebhook` yet | Yes (capture/GET)                    | Yes    |
| `razorpay`      | Officially documented | `https://api.razorpay.com`                                     | `https://api.razorpay.com`                 | Yes (order + payment link)      | Yes      | Yes (`X-Razorpay-Signature`)                     | Yes (HMAC + API)                     | Yes    |
| `paddle`        | Officially documented | `https://sandbox-api.paddle.com`                               | `https://api.paddle.com`                   | Yes (`/transactions`)           | Yes      | Yes (`Paddle-Signature`)                         | Yes                                  | Yes    |
| `bkash`         | Officially documented | `https://tokenized.sandbox.bka.sh/v1.2.0-beta`                 | `https://tokenized.pay.bka.sh/v1.2.0-beta` | Yes (tokenized)                 | Yes      | No                                               | Yes (execute/query)                  | No     |
| `shurjopay`     | Officially documented | `https://sandbox.shurjopayment.com`                            | `https://engine.shurjopayment.com`         | Yes (token → secret-pay)        | Yes      | No                                               | Yes (`/api/verification`)            | No     |
| `nagad`         | **Verify**            | `https://sandbox.mynagad.com:10060/remote-payment-gateway-1.0` | `https://api.mynagad.com/api/dfs`          | Yes (init/complete)             | Yes      | No                                               | Yes (path present; crypto TBD)       | No     |
| `upay`          | **Merchant-specific** | `null` (set `apiBaseUrl`)                                      | `null`                                     | Manual default; API if base set | Optional | No                                               | Manual / merchant API                | No     |
| `rocket`        | **Manual**            | `null`                                                         | `null`                                     | Manual MFS                      | No       | No                                               | Never auto-paid                      | No     |
| `bank_transfer` | **Manual**            | `null`                                                         | `null`                                     | Manual instructions             | No       | No                                               | Never auto-paid                      | No     |

## Path helpers

```ts
paymentCallbackUrl(gateway, 'success' | 'fail' | 'cancel');
// → {APP}/api/payments/callback/{gateway}/{outcome}

paymentWebhookUrl(gateway);
// → {APP}/api/payments/webhook/{gateway}
```

`APP` = `NEXT_PUBLIC_APP_URL` or `APP_URL` (see `appBaseUrl()`).
