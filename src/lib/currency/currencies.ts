export const SUPPORTED_CURRENCIES = ["BRL", "USD"] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

/** Non-cash currencies invoiced through a settlement platform (v1: USD only). */
export const FX_INCOME_CURRENCIES = [
	"USD",
] as const satisfies readonly CurrencyCode[];

export type FxIncomeCurrencyCode = (typeof FX_INCOME_CURRENCIES)[number];

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
	BRL: "Brazilian Real",
	USD: "US Dollar",
};
