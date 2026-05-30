import type { z } from "zod";
import { createCashAccountFormSchema } from "./create-cash-account-form-schema";

export const updateCashAccountFormSchema = createCashAccountFormSchema;

export type UpdateCashAccountFormValues = z.infer<
	typeof updateCashAccountFormSchema
>;
