import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "#/db";
import { cashAccount } from "#/db/schemas";
import { toMinorUnits } from "#/lib/currency/minor-units";
import { appMutationFn } from "#/lib/query/app-mutation-fn";
import { invalidateOnSuccess } from "#/lib/query/invalidate-on-success";
import { authMiddleware } from "#/lib/server-fn/auth-middleware";
import { createSuccessResponse } from "#/lib/server-fn/create-success-response";
import { ExistingCashAccountError } from "../lib/cash-account-errors";
import { getFirstCashAccount } from "../lib/get-first-cash-account";
import { cashAccountListQueryOptions } from "../queries/cash-account-list-query-options";
import { createCashAccountFormSchema } from "../schemas/create-cash-account-form-schema";

const createCashAccountMutationInputSchema = z.object({
	formData: createCashAccountFormSchema,
});

const createCashAccountServerFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(createCashAccountMutationInputSchema)
	.handler(async ({ data, context: { user } }) => {
		const existingCashAccount = await getFirstCashAccount(user.id);
		if (existingCashAccount) {
			throw new ExistingCashAccountError();
		}

		await db.insert(cashAccount).values({
			userId: user.id,
			name: data.formData.name,
			balanceMinor: toMinorUnits(data.formData.balanceMajor),
			balanceAsOfDate: data.formData.balanceAsOfDate,
		});

		return createSuccessResponse({ message: "Cash account created" });
	});

export function createCashAccountMutationOptions() {
	return mutationOptions({
		mutationFn: appMutationFn(createCashAccountServerFn),
		onSuccess: async (...args) => {
			await invalidateOnSuccess(args, cashAccountListQueryOptions().queryKey);
		},
	});
}
