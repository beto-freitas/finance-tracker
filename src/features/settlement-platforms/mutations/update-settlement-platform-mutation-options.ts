import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { settlementPlatform } from "#/db/schemas";
import { requireCashAccount } from "#/features/cash-accounts/lib/require-cash-account";
import { spreadPercentMajorToBasisPoints } from "#/lib/currency/basis-points";
import { assumedBaseRateMajorToMinor } from "#/lib/currency/exchange-rate-minor";
import { appMutationFn } from "#/lib/query/app-mutation-fn";
import { invalidateOnSuccess } from "#/lib/query/invalidate-on-success";
import { authMiddleware } from "#/lib/server-fn/auth-middleware";
import { createSuccessResponse } from "#/lib/server-fn/create-success-response";
import { SettlementPlatformNotFoundError } from "../lib/settlement-platform-errors";
import { settlementPlatformListQueryOptions } from "../queries/settlement-platform-list-query-options";
import { settlementPlatformFormSchema } from "../schemas/settlement-platform-form-schema";

const updateSettlementPlatformMutationInputSchema = z.object({
	settlementPlatformId: z.uuid(),
	formData: settlementPlatformFormSchema,
});

const updateSettlementPlatformServerFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(updateSettlementPlatformMutationInputSchema)
	.handler(async ({ data, context: { user } }) => {
		await requireCashAccount(user.id);

		const existing = await db.query.settlementPlatform.findFirst({
			where: {
				id: data.settlementPlatformId,
				userId: user.id,
			},
			columns: { id: true },
		});
		if (!existing) {
			throw new SettlementPlatformNotFoundError();
		}

		const { formData } = data;
		await db
			.update(settlementPlatform)
			.set({
				name: formData.name,
				incomeCurrency: formData.incomeCurrency,
				exchangeSpreadBasisPoints: spreadPercentMajorToBasisPoints(
					formData.exchangeSpreadPercentMajor,
				),
				assumedBaseRateMinor: assumedBaseRateMajorToMinor(
					formData.assumedBaseRateMajor,
				),
			})
			.where(
				and(
					eq(settlementPlatform.id, data.settlementPlatformId),
					eq(settlementPlatform.userId, user.id),
				),
			);

		return createSuccessResponse({ message: "Settlement platform updated" });
	});

export function updateSettlementPlatformMutationOptions() {
	return mutationOptions({
		mutationFn: appMutationFn(updateSettlementPlatformServerFn),
		onSuccess: async (...args) => {
			await invalidateOnSuccess(
				args,
				settlementPlatformListQueryOptions(true).queryKey,
			);
		},
	});
}
