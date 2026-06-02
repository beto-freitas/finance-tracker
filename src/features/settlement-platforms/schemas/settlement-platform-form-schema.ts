import { z } from "zod";
import { FX_INCOME_CURRENCIES } from "#/lib/currency/currencies";

export const settlementPlatformFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Name is required")
		.max(120, "Name is too long"),
	incomeCurrency: z.enum(FX_INCOME_CURRENCIES),
	exchangeSpreadPercentMajor: z
		.number({ error: "Spread must be a number" })
		.min(0.01, "Spread must be at least 0.01%")
		.max(100, "Spread must be at most 100%"),
	assumedBaseRateMajor: z
		.number({ error: "Base rate must be a number" })
		.min(0.01, "Base rate must be greater than zero")
		.max(9999.99, "Base rate is too large"),
});

export type SettlementPlatformFormValues = z.infer<
	typeof settlementPlatformFormSchema
>;
