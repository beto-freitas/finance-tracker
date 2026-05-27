import type { CurrencyCode } from "#/lib/currency.ts";

const DEFAULT_LOCALE = "pt-BR";

export type CurrencyAddonSide = "inline-start" | "inline-end";

export type CurrencyDisplayMeta = {
	symbol: string;
	addonSide: CurrencyAddonSide;
	minimumFractionDigits: number;
	maximumFractionDigits: number;
};

/** Locale for currency display; defaults to browser, then {@link DEFAULT_LOCALE}. */
export function resolveCurrencyLocale(locale?: string): string {
	if (locale) return locale;
	if (typeof navigator !== "undefined" && navigator.language) {
		return navigator.language;
	}
	return DEFAULT_LOCALE;
}

/** Symbol placement, fraction scale, and symbol text from `Intl` for a currency code. */
export function getCurrencyDisplayMeta(
	currency: CurrencyCode,
	locale?: string,
): CurrencyDisplayMeta {
	const resolvedLocale = resolveCurrencyLocale(locale);
	const formatter = new Intl.NumberFormat(resolvedLocale, {
		style: "currency",
		currency,
	});
	const { minimumFractionDigits, maximumFractionDigits } =
		formatter.resolvedOptions();

	const parts = formatter.formatToParts(1);
	const currencyIndex = parts.findIndex((part) => part.type === "currency");
	const integerIndex = parts.findIndex((part) => part.type === "integer");

	const currencyPart = parts[currencyIndex];
	if (!currencyPart || currencyIndex < 0) {
		throw new Error(`Intl did not return a currency part for ${currency}`);
	}

	const addonSide: CurrencyAddonSide =
		integerIndex >= 0 && currencyIndex > integerIndex
			? "inline-end"
			: "inline-start";

	return {
		symbol: currencyPart.value,
		addonSide,
		minimumFractionDigits: minimumFractionDigits ?? maximumFractionDigits ?? 0,
		maximumFractionDigits: maximumFractionDigits ?? 0,
	};
}
