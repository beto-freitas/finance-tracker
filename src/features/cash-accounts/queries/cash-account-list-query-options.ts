import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { db } from "#/db";
import { fromMinorUnits } from "#/lib/currency/minor-units";
import { appQueryFn } from "#/lib/query/app-query-fn";
import { authMiddleware } from "#/lib/server-fn/auth-middleware";
import { createSuccessResponse } from "#/lib/server-fn/create-success-response";
import type { AppServerFnResult } from "#/lib/server-fn/response-data";

const getCashAccountListServerFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context: { user } }) => {
		const cashAccounts = await db.query.cashAccount.findMany({
			where: {
				userId: user.id,
			},
			columns: {
				id: true,
				name: true,
				balanceMinor: true,
				balanceAsOfDate: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		return createSuccessResponse({
			data: cashAccounts.map((row) => ({
				id: row.id,
				name: row.name,
				balanceMajor: fromMinorUnits(row.balanceMinor),
				balanceAsOfDate: row.balanceAsOfDate,
			})),
		});
	});

export type CashAccountListItem = AppServerFnResult<
	typeof getCashAccountListServerFn
>[number];

export function cashAccountListQueryOptions() {
	return queryOptions({
		queryKey: ["cash-accounts", "list"],
		queryFn: appQueryFn(getCashAccountListServerFn),
	});
}
