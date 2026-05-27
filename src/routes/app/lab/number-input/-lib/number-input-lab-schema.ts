import { z } from "zod";

import type { FormValuesWithEmptyNumbers } from "#/lib/form/form-values.ts";

export const numberInputLabSchema = z.object({
	referenceEmpty: z.string(),
	amountEmpty: z.number(),

	referencePrefilled: z.string(),
	amountPrefilled: z.number(),

	referenceZero: z.string(),
	amountZero: z.number().optional(),

	referenceNegative: z.string(),
	amountNegative: z.number().optional(),

	referenceNoNegative: z.string(),
	amountNoNegative: z.number().min(0, "Must be zero or positive").optional(),

	referenceEnUs: z.string(),
	amountEnUs: z.number().optional(),

	referenceDeDe: z.string(),
	amountDeDe: z.number().optional(),

	referenceInteger: z.string(),
	amountInteger: z.number().optional(),

	referenceHighPrecision: z.string(),
	amountHighPrecision: z.number().optional(),

	referenceAddons: z.string(),
	amountAddons: z.number().optional(),

	referenceStepOne: z.string(),
	amountStepOne: z.number().optional(),

	referenceDisabled: z.string(),
	amountDisabled: z.number().optional(),
});

export type NumberInputLabValues = z.infer<typeof numberInputLabSchema>;

export type NumberInputLabFormValues =
	FormValuesWithEmptyNumbers<NumberInputLabValues>;
