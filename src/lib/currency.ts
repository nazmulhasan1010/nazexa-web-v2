/**
 * Multi-currency pricing support.
 *
 * Plan prices are stored in USD (see `Plan.price`). Everything else is a
 * display-time conversion: rates below are indicative and hand-maintained,
 * so any real charge must still be settled in the plan's stored currency.
 */

export type CurrencyCode = "USD" | "EUR" | "GBP" | "INR" | "BDT";

export interface CurrencyDef {
  code: CurrencyCode;
  /** Short glyph for compact UI (switchers, chips). */
  symbol: string;
  label: string;
  locale: string;
  /** Units of this currency per 1 USD. Indicative — refresh periodically. */
  rate: number;
  /** Converted amounts are rounded to this step. */
  step: number;
  /** Subtracted after rounding for charm pricing (0 disables). */
  charm: number;
  decimals: number;
}

export const BASE_CURRENCY: CurrencyCode = "USD";
export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export const CURRENCIES: Record<CurrencyCode, CurrencyDef> = {
  USD: {
    code: "USD",
    symbol: "$",
    label: "US Dollar",
    locale: "en-US",
    rate: 1,
    step: 1,
    charm: 0,
    decimals: 2,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    label: "Euro",
    locale: "de-DE",
    rate: 0.92,
    step: 1,
    charm: 0.01,
    decimals: 2,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    label: "British Pound",
    locale: "en-GB",
    rate: 0.79,
    step: 1,
    charm: 0.01,
    decimals: 2,
  },
  INR: {
    code: "INR",
    symbol: "₹",
    label: "Indian Rupee",
    locale: "en-IN",
    rate: 83.5,
    step: 10,
    charm: 1,
    decimals: 0,
  },
  BDT: {
    code: "BDT",
    symbol: "৳",
    label: "Bangladeshi Taka",
    // en-BD, not bn-BD: the Bengali locale renders Bengali numerals, which
    // clash with the Latin digits used everywhere else in the UI.
    locale: "en-BD",
    rate: 122,
    step: 10,
    charm: 1,
    decimals: 0,
  },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === "string" && value in CURRENCIES;
}

const EUROZONE = [
  "AT",
  "BE",
  "CY",
  "DE",
  "EE",
  "ES",
  "FI",
  "FR",
  "GR",
  "HR",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "PT",
  "SI",
  "SK",
  "AD",
  "MC",
  "SM",
  "VA",
  "ME",
];

/** ISO-3166-1 alpha-2 country → currency. Anything unmapped falls back to USD. */
export const COUNTRY_CURRENCY: Record<string, CurrencyCode> = {
  BD: "BDT",
  IN: "INR",
  GB: "GBP",
  IM: "GBP",
  JE: "GBP",
  GG: "GBP",
  ...Object.fromEntries(EUROZONE.map((c) => [c, "EUR" as CurrencyCode])),
};

export function currencyForCountry(
  country: string | null | undefined,
): CurrencyCode {
  if (!country) return DEFAULT_CURRENCY;
  return COUNTRY_CURRENCY[country.toUpperCase()] ?? DEFAULT_CURRENCY;
}

/** Convert a USD amount into `code`, with per-currency rounding applied. */
export function convertPrice(usdAmount: number, code: CurrencyCode): number {
  const def = CURRENCIES[code];
  if (!Number.isFinite(usdAmount) || usdAmount <= 0) return 0;
  if (code === BASE_CURRENCY) return usdAmount;

  const raw = usdAmount * def.rate;
  const rounded = Math.round(raw / def.step) * def.step;
  return Math.max(0, Number((rounded - def.charm).toFixed(def.decimals)));
}

export function formatMoney(amount: number, code: CurrencyCode): string {
  const def = CURRENCIES[code];
  try {
    return new Intl.NumberFormat(def.locale, {
      style: "currency",
      currency: def.code,
      minimumFractionDigits: def.decimals,
      maximumFractionDigits: def.decimals,
    }).format(amount);
  } catch {
    return `${def.symbol}${amount.toFixed(def.decimals)}`;
  }
}

/** Convert then format a stored USD price for display. */
export function formatPrice(usdAmount: number, code: CurrencyCode): string {
  return formatMoney(convertPrice(usdAmount, code), code);
}
