export const SUPPORTED_CURRENCIES = ["BRL", "USD"] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
	BRL: "Brazilian Real",
	USD: "US Dollar",
};
