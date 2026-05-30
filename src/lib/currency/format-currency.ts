import type { CurrencyCode } from "./currencies";

// TODO: extract get-locale helper & reuse on date & currency
// & maybe reuse function from form/currency-display.ts instead of creating a new one (or the other way around & refactor the other one - probably the best option - same thing for date & number)
export const formatCurrency = (
	amountMajor: number,
	locale: string = "pt-BR",
	currency: CurrencyCode = "BRL",
) => {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
	}).format(amountMajor);
};
