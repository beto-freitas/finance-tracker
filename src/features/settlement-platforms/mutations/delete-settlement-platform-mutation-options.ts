import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { db } from "#/db";
import { settlementPlatform } from "#/db/schemas";
import { requireCashAccount } from "#/features/cash-accounts/lib/require-cash-account";
import { appMutationFn } from "#/lib/query/app-mutation-fn";
import { invalidateOnSuccess } from "#/lib/query/invalidate-on-success";
import { authMiddleware } from "#/lib/server-fn/auth-middleware";
import { createSuccessResponse } from "#/lib/server-fn/create-success-response";
import { countSettlementPlatformReferences } from "../lib/count-settlement-platform-references";
import {
	SettlementPlatformInUseError,
	SettlementPlatformNotFoundError,
} from "../lib/settlement-platform-errors";
import { settlementPlatformListQueryOptions } from "../queries/settlement-platform-list-query-options";
import { deleteSettlementPlatformInputSchema } from "../schemas/delete-settlement-platform-input-schema";

const deleteSettlementPlatformServerFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(deleteSettlementPlatformInputSchema)
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

		const { sourceCount, receiptCount } =
			await countSettlementPlatformReferences(
				user.id,
				data.settlementPlatformId,
			);
		if (sourceCount > 0 || receiptCount > 0) {
			throw new SettlementPlatformInUseError(sourceCount, receiptCount);
		}

		await db
			.delete(settlementPlatform)
			.where(
				and(
					eq(settlementPlatform.id, data.settlementPlatformId),
					eq(settlementPlatform.userId, user.id),
				),
			);

		return createSuccessResponse({ message: "Settlement platform deleted" });
	});

export function deleteSettlementPlatformMutationOptions() {
	return mutationOptions({
		mutationFn: appMutationFn(deleteSettlementPlatformServerFn),
		onSuccess: async (...args) => {
			await invalidateOnSuccess(
				args,
				settlementPlatformListQueryOptions(true).queryKey,
			);
		},
	});
}
