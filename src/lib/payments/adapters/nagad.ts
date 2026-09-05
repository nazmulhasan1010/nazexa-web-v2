/**
 * Nagad DFS checkout — merchant-documentation dependent.
 *
 * documentationStatus: verify (see gatewayEndpoints.nagad)
 *
 * Implements init → complete → verify structure using endpoints from endpoints.ts.
 * RSA sensitiveData/signature placeholders are clearly marked — do NOT enable
 * production until merchant docs confirm exact crypto and base URLs.
 */

import { createSign, createVerify, randomBytes } from 'node:crypto';
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  GatewayConfigSchema,
  PaymentEnvironment,
  PaymentGatewayAdapter,
  PaymentStatusInput,
  PaymentStatusResult,
  ValidationResult,
  VerifyPaymentInput,
  PaymentVerificationResult,
  TestConnectionResult,
} from '@/lib/payments/types';
import { gatewayEndpoints, resolveBaseUrl } from '@/lib/payments/endpoints';
import {
  amountsMatch,
  asStringConfig,
  cfg,
  currenciesMatch,
  isSandbox,
  jsonFetch,
  normalizeCurrency,
  requireFields,
  safeSummary,
} from './base';

/** Explicit status from endpoints registry — do not treat as fully verified. */
export const NAGAD_DOCUMENTATION_STATUS = gatewayEndpoints.nagad.documentationStatus;

function baseUrl(environment: PaymentEnvironment, config: Record<string, string>): string {
  const override = cfg(config, 'apiBaseUrl');
  if (override && /^https:\/\//i.test(override)) return override.replace(/\/$/, '');
  const env = isSandbox(environment, config) ? 'sandbox' : 'production';
  return resolveBaseUrl('nagad', env) || gatewayEndpoints.nagad.sandbox;
}

function nowNagadDatetime(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

/**
 * RSA-SHA256 sign — PLACEHOLDER until merchant docs confirm algorithm/padding.
 * Requires PEM private key in config.merchantPrivateKey.
 */
function rsaSignPlaceholder(payload: string, privateKeyPem: string): string | null {
  if (!privateKeyPem.includes('PRIVATE KEY')) return null;
  try {
    const signer = createSign('RSA-SHA256');
    signer.update(payload, 'utf8');
    signer.end();
    return signer.sign(privateKeyPem, 'base64');
  } catch {
    return null;
  }
}

/**
 * RSA-SHA256 verify — PLACEHOLDER until merchant docs confirm.
 */
function rsaVerifyPlaceholder(
  payload: string,
  signatureB64: string,
  publicKeyPem: string,
): boolean {
  if (!publicKeyPem.includes('PUBLIC KEY')) return false;
  try {
    const verifier = createVerify('RSA-SHA256');
    verifier.update(payload, 'utf8');
    verifier.end();
    return verifier.verify(publicKeyPem, signatureB64, 'base64');
  } catch {
    return false;
  }
}

export const nagadAdapter: PaymentGatewayAdapter = {
  code: 'nagad',

  getConfigSchema(): GatewayConfigSchema {
    return {
      fields: [
        { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
        {
          key: 'merchantNumber',
          label: 'Merchant number (display)',
          type: 'text',
          required: false,
          public: true,
        },
        {
          key: 'merchantPrivateKey',
          label: 'Merchant RSA private key (PEM)',
          type: 'textarea',
          required: true,
          secret: true,
          help: 'Required for DFS init/complete. Format must match merchant documentation.',
        },
        {
          key: 'nagadPublicKey',
          label: 'Nagad RSA public key (PEM)',
          type: 'textarea',
          required: true,
          help: 'Used to verify Nagad responses when docs specify RSA verification.',
        },
        {
          key: 'environment',
          label: 'Environment',
          type: 'select',
          required: true,
          options: [
            { value: 'sandbox', label: 'Sandbox' },
            { value: 'production', label: 'Live' },
          ],
        },
        {
          key: 'apiBaseUrl',
          label: 'API base URL override',
          type: 'url',
          required: false,
          help: 'Only if merchant docs provide a different base than endpoints.ts.',
        },
      ],
    };
  },

  validateConfig(config: unknown): ValidationResult {
    const c = asStringConfig(config);
    const base = requireFields(c, ['merchantId', 'merchantPrivateKey', 'nagadPublicKey']);
    if (!base.valid) return base;
    return {
      valid: true,
      errors: [],
    };
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const validation = this.validateConfig(input.config);
    if (!validation.valid) return { ok: false, error: validation.errors.join('; ') };

    if (normalizeCurrency(input.currency) !== 'BDT') {
      return { ok: false, error: 'Nagad typically supports BDT only' };
    }

    const merchantId = cfg(input.config, 'merchantId');
    const orderId = input.publicId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
    const datetime = nowNagadDatetime();
    const challenge = randomBytes(20).toString('hex');

    // sensitiveData + signature — structure per common Nagad DFS; crypto must be confirmed.
    const sensitiveObject = {
      merchantId,
      datetime,
      orderId,
      challenge,
    };
    const sensitiveJson = JSON.stringify(sensitiveObject);
    const signature = rsaSignPlaceholder(
      sensitiveJson,
      cfg(input.config, 'merchantPrivateKey'),
    );

    if (!signature) {
      return {
        ok: false,
        error:
          'Nagad RSA sign failed. Confirm merchantPrivateKey PEM format against merchant docs. ' +
          `documentationStatus=${NAGAD_DOCUMENTATION_STATUS}`,
        rawSummary: safeSummary({ documentationStatus: NAGAD_DOCUMENTATION_STATUS }),
      };
    }

    // PLACEHOLDER: many integrations base64-encode the sensitive JSON; confirm with merchant docs.
    const sensitiveData = Buffer.from(sensitiveJson, 'utf8').toString('base64');

    const initPath = gatewayEndpoints.nagad.paths.init;
    const initUrl = `${baseUrl(input.environment, input.config)}${initPath}/${merchantId}/${orderId}`;

    const initRes = await jsonFetch<{
      sensitiveData?: string;
      signature?: string;
      acceptRegularPayment?: boolean;
      message?: string;
      reason?: string;
    }>(initUrl, {
      method: 'POST',
      headers: {
        'X-KM-IP-V4': '127.0.0.1',
        'X-KM-Client-Type': 'PC_WEB',
        'X-KM-Api-Version': 'v-0.2.0',
      },
      body: {
        datetime,
        orderId,
        sensitiveData,
        signature,
      },
    });

    if (!initRes.ok || !initRes.data?.sensitiveData) {
      return {
        ok: false,
        error:
          initRes.data?.message ||
          initRes.data?.reason ||
          initRes.error ||
          `Nagad initialize failed (documentationStatus=${NAGAD_DOCUMENTATION_STATUS})`,
        rawSummary: safeSummary({
          documentationStatus: NAGAD_DOCUMENTATION_STATUS,
          status: initRes.status,
          body: initRes.data,
        }),
      };
    }

    // Decrypt/verify response sensitiveData — PLACEHOLDER: merchant docs define exact encoding.
    let paymentRefId: string | undefined;
    let challengeResp: string | undefined;
    try {
      const decoded = Buffer.from(initRes.data.sensitiveData, 'base64').toString('utf8');
      if (initRes.data.signature) {
        const ok = rsaVerifyPlaceholder(
          decoded,
          initRes.data.signature,
          cfg(input.config, 'nagadPublicKey'),
        );
        if (!ok) {
          return {
            ok: false,
            error:
              'Nagad init response signature verification failed (confirm RSA scheme with merchant docs)',
            rawSummary: safeSummary({ documentationStatus: NAGAD_DOCUMENTATION_STATUS }),
          };
        }
      }
      const parsed = JSON.parse(decoded) as {
        paymentReferenceNumber?: string;
        paymentRefId?: string;
        challenge?: string;
      };
      paymentRefId = parsed.paymentReferenceNumber || parsed.paymentRefId;
      challengeResp = parsed.challenge;
    } catch {
      return {
        ok: false,
        error:
          'Unable to parse Nagad init sensitiveData — confirm encoding with merchant documentation',
        rawSummary: safeSummary({ documentationStatus: NAGAD_DOCUMENTATION_STATUS }),
      };
    }

    if (!paymentRefId) {
      return {
        ok: false,
        error: 'Nagad init did not return payment reference',
        rawSummary: safeSummary({ documentationStatus: NAGAD_DOCUMENTATION_STATUS }),
      };
    }

    const completeSensitive = {
      merchantId,
      orderId,
      currencyCode: '050',
      amount: input.amount,
      challenge: challengeResp || challenge,
    };
    const completeJson = JSON.stringify(completeSensitive);
    const completeSig = rsaSignPlaceholder(
      completeJson,
      cfg(input.config, 'merchantPrivateKey'),
    );
    if (!completeSig) {
      return {
        ok: false,
        error: 'Nagad complete RSA sign failed',
        rawSummary: safeSummary({ documentationStatus: NAGAD_DOCUMENTATION_STATUS }),
      };
    }

    const completePath = gatewayEndpoints.nagad.paths.complete;
    const completeUrl = `${baseUrl(input.environment, input.config)}${completePath}/${paymentRefId}`;

    const completeRes = await jsonFetch<{
      callBackUrl?: string;
      status?: string;
      message?: string;
      reason?: string;
    }>(completeUrl, {
      method: 'POST',
      headers: {
        'X-KM-IP-V4': '127.0.0.1',
        'X-KM-Client-Type': 'PC_WEB',
        'X-KM-Api-Version': 'v-0.2.0',
      },
      body: {
        datetime: nowNagadDatetime(),
        sensitiveData: Buffer.from(completeJson, 'utf8').toString('base64'),
        signature: completeSig,
        merchantCallbackURL: input.successUrl,
      },
    });

    const redirectUrl = completeRes.data?.callBackUrl;
    if (!completeRes.ok || !redirectUrl) {
      return {
        ok: false,
        error:
          completeRes.data?.message ||
          completeRes.data?.reason ||
          completeRes.error ||
          `Nagad complete failed (documentationStatus=${NAGAD_DOCUMENTATION_STATUS})`,
        gatewayOrderId: orderId,
        gatewayPaymentId: paymentRefId,
        rawSummary: safeSummary({
          documentationStatus: NAGAD_DOCUMENTATION_STATUS,
          body: completeRes.data,
        }),
      };
    }

    return {
      ok: true,
      redirectUrl,
      gatewayOrderId: orderId,
      gatewayPaymentId: paymentRefId,
      rawSummary: safeSummary({
        documentationStatus: NAGAD_DOCUMENTATION_STATUS,
        orderId,
        paymentRefId,
        note: 'RSA placeholders — verify against merchant docs before production',
      }),
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    const paymentRef =
      input.gatewayPaymentId ||
      input.callbackParams?.payment_ref_id ||
      input.callbackParams?.paymentRefId;
    const orderId =
      input.gatewayOrderId ||
      input.callbackParams?.order_id ||
      input.callbackParams?.orderId ||
      input.publicId;

    if (!paymentRef && !orderId) {
      return { ok: false, paid: false, status: 'UNKNOWN', error: 'Missing Nagad references' };
    }

    const verifyPath = gatewayEndpoints.nagad.paths.verify;
    const verifyUrl =
      `${baseUrl(input.environment, input.config)}${verifyPath}` +
      `/${encodeURIComponent(String(paymentRef || orderId))}`;

    const res = await jsonFetch<{
      status?: string;
      orderId?: string;
      issuerPaymentRefNo?: string;
      amount?: string;
      currencyCode?: string;
      message?: string;
    }>(verifyUrl, { method: 'GET' });

    if (!res.ok || !res.data) {
      return {
        ok: false,
        paid: false,
        status: 'UNKNOWN',
        error:
          res.data?.message ||
          res.error ||
          `Nagad verify failed (documentationStatus=${NAGAD_DOCUMENTATION_STATUS})`,
        rawSummary: safeSummary({
          documentationStatus: NAGAD_DOCUMENTATION_STATUS,
          body: res.data,
        }),
      };
    }

    const status = String(res.data.status || '').toLowerCase();
    const paid = status === 'success' || status === 'paid' || status === 'complete';
    const amountOk =
      res.data.amount == null || amountsMatch(input.amount, res.data.amount);
    const currencyOk =
      !res.data.currencyCode ||
      res.data.currencyCode === '050' ||
      currenciesMatch(input.currency, res.data.currencyCode);

    if (paid && (!amountOk || !currencyOk)) {
      return {
        ok: false,
        paid: false,
        status: 'FAILED',
        error: 'Nagad amount/currency mismatch',
        amount: res.data.amount,
        rawSummary: safeSummary({
          documentationStatus: NAGAD_DOCUMENTATION_STATUS,
          body: res.data,
        }),
      };
    }

    return {
      ok: true,
      paid: Boolean(paid && amountOk && currencyOk),
      status: paid ? 'PAID' : 'PENDING',
      gatewayOrderId: res.data.orderId || String(orderId),
      gatewayTransactionId: res.data.issuerPaymentRefNo,
      gatewayPaymentId: paymentRef ? String(paymentRef) : undefined,
      amount: res.data.amount,
      currency: 'BDT',
      rawSummary: safeSummary({
        documentationStatus: NAGAD_DOCUMENTATION_STATUS,
        status: res.data.status,
        orderId: res.data.orderId,
      }),
    };
  },

  async getPaymentStatus(input: PaymentStatusInput): Promise<PaymentStatusResult> {
    const result = await this.verifyPayment({
      transactionId: '',
      publicId: '',
      amount: '0',
      currency: 'BDT',
      gatewayOrderId: input.gatewayOrderId,
      gatewayPaymentId: input.gatewayPaymentId,
      gatewayTransactionId: input.gatewayTransactionId,
      config: input.config,
      environment: input.environment,
    });
    return {
      ok: result.ok,
      paid: result.paid,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
      error: result.error,
    };
  },

  async testConnection(
    config: Record<string, string>,
    environment: PaymentEnvironment,
  ): Promise<TestConnectionResult> {
    void environment;
    const v = this.validateConfig(config);
    if (!v.valid) return { ok: false, message: v.errors.join('; '), liveVerified: false };
    const canSign = Boolean(
      rsaSignPlaceholder('{"ping":true}', cfg(config, 'merchantPrivateKey')),
    );
    return {
      ok: canSign,
      message: canSign
        ? `Nagad keys parse for RSA-SHA256 placeholder. documentationStatus=${NAGAD_DOCUMENTATION_STATUS} — confirm crypto & URLs with merchant docs before production.`
        : 'merchantPrivateKey could not sign with RSA-SHA256 placeholder',
      liveVerified: false,
    };
  },
};
