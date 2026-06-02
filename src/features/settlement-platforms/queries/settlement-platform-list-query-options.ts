import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { db } from "#/db";
import { computeEffectiveRateMinor } from "#/domain/income/effective-exchange-rate";
import { requireCashAccount } from "#/features/cash-accounts/lib/require-cash-account";
import { basisPointsToSpreadPercentMajor } from "#/lib/currency/basis-points";
import {
	assumedBaseRateMinorToMajor,
	effectiveRateMinorToMajor,
} from "#/lib/currency/exchange-rate-minor";
import { appQueryFn } from "#/lib/query/app-query-fn";
import { authMiddleware } from "#/lib/server-fn/auth-middleware";
import { createSuccessResponse } from "#/lib/server-fn/create-success-response";
import type { AppServerFnResult } from "#/lib/server-fn/response-data";

const getSettlementPlatformListServerFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context: { user } }) => {
		await requireCashAccount(user.id);

		const rows = await db.query.settlementPlatform.findMany({
			where: { userId: user.id },
			columns: {
				id: true,
				name: true,
				incomeCurrency: true,
				exchangeSpreadBasisPoints: true,
				assumedBaseRateMinor: true,
				updatedAt: true,
			},
			orderBy: { updatedAt: "desc" },
		});

		return createSuccessResponse({
			data: rows.map((row) => {
				const effectiveRateMinor = computeEffectiveRateMinor(
					row.assumedBaseRateMinor,
					row.exchangeSpreadBasisPoints,
				);
				return {
					id: row.id,
					name: row.name,
					incomeCurrency: row.incomeCurrency,
					exchangeSpreadPercentMajor: basisPointsToSpreadPercentMajor(
						row.exchangeSpreadBasisPoints,
					),
					assumedBaseRateMajor: assumedBaseRateMinorToMajor(
						row.assumedBaseRateMinor,
					),
					effectiveRateMajor: effectiveRateMinorToMajor(effectiveRateMinor),
					updatedAt: row.updatedAt,
				};
			}),
		});
	});

export type SettlementPlatformListItem = AppServerFnResult<
	typeof getSettlementPlatformListServerFn
>[number];

export function settlementPlatformListQueryOptions(enabled: boolean) {
	return queryOptions({
		queryKey: ["settlement-platforms", "list"],
		queryFn: appQueryFn(getSettlementPlatformListServerFn),
		enabled,
	});
}
