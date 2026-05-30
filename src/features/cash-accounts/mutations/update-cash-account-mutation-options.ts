import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { cashAccount } from "#/db/schemas";
import { toMinorUnits } from "#/lib/currency/minor-units";
import { appMutationFn } from "#/lib/query/app-mutation-fn";
import { invalidateOnSuccess } from "#/lib/query/invalidate-on-success";
import { authMiddleware } from "#/lib/server-fn/auth-middleware";
import { createSuccessResponse } from "#/lib/server-fn/create-success-response";
import { CashAccountNotFoundError } from "../lib/cash-account-errors";
import { getFirstCashAccount } from "../lib/get-first-cash-account";
import { cashAccountListQueryOptions } from "../queries/cash-account-list-query-options";
import { updateCashAccountFormSchema } from "../schemas/update-cash-account-form-schema";

const updateCashAccountMutationInputSchema = z.object({
	cashAccountId: z.string().min(1),
	formData: updateCashAccountFormSchema,
});

const updateCashAccountServerFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(updateCashAccountMutationInputSchema)
	.handler(async ({ data, context: { user } }) => {
		const existingCashAccount = await getFirstCashAccount(
			user.id,
			data.cashAccountId,
		);
		if (!existingCashAccount) {
			throw new CashAccountNotFoundError();
		}

		await db
			.update(cashAccount)
			.set({
				name: data.formData.name,
				balanceMinor: toMinorUnits(data.formData.balanceMajor),
				balanceAsOfDate: data.formData.balanceAsOfDate,
			})
			.where(
				and(
					eq(cashAccount.id, data.cashAccountId),
					eq(cashAccount.userId, user.id),
				),
			);

		return createSuccessResponse({ message: "Cash account updated" });
	});

export function updateCashAccountMutationOptions() {
	return mutationOptions({
		mutationFn: appMutationFn(updateCashAccountServerFn),
		onSuccess: async (...args) => {
			await invalidateOnSuccess(args, cashAccountListQueryOptions().queryKey);
		},
	});
}
