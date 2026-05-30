import { z } from "zod";

export const createCashAccountFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Name is required")
		.max(120, "Name is too long"),
	balanceMajor: z
		.number({ error: "Balance must be a number" })
		.min(0, "Balance must be zero or greater"),
	balanceAsOfDate: z.iso.date("Date must be in YYYY-MM-DD format"),
});

export type CreateCashAccountFormValues = z.infer<
	typeof createCashAccountFormSchema
>;
