import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
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
import { settlementPlatformListQueryOptions } from "../queries/settlement-platform-list-query-options";
import { settlementPlatformFormSchema } from "../schemas/settlement-platform-form-schema";

const createSettlementPlatformMutationInputSchema = z.object({
	formData: settlementPlatformFormSchema,
});

const createSettlementPlatformServerFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(createSettlementPlatformMutationInputSchema)
	.handler(async ({ data, context: { user } }) => {
		await requireCashAccount(user.id);

		const { formData } = data;
		await db.insert(settlementPlatform).values({
			userId: user.id,
			name: formData.name,
			incomeCurrency: formData.incomeCurrency,
			exchangeSpreadBasisPoints: spreadPercentMajorToBasisPoints(
				formData.exchangeSpreadPercentMajor,
			),
			assumedBaseRateMinor: assumedBaseRateMajorToMinor(
				formData.assumedBaseRateMajor,
			),
		});

		return createSuccessResponse({ message: "Settlement platform created" });
	});

export function createSettlementPlatformMutationOptions() {
	return mutationOptions({
		mutationFn: appMutationFn(createSettlementPlatformServerFn),
		onSuccess: async (...args) => {
			await invalidateOnSuccess(
				args,
				settlementPlatformListQueryOptions(true).queryKey,
			);
		},
	});
}
