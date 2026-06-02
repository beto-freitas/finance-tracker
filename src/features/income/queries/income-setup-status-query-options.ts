import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { db } from "#/db";
import { appQueryFn } from "#/lib/query/app-query-fn";
import { authMiddleware } from "#/lib/server-fn/auth-middleware";
import { createSuccessResponse } from "#/lib/server-fn/create-success-response";

const getIncomeSetupStatusServerFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context: { user } }) => {
		const incomeSource = await db.query.incomeSource.findFirst({
			where: { userId: user.id },
			columns: { id: true },
		});
		const hasIncomeSources = incomeSource != null;

		return createSuccessResponse({
			data: { hasIncomeSources },
		});
	});

export function incomeSetupStatusQueryOptions() {
	return queryOptions({
		queryKey: ["income", "setup-status"],
		queryFn: appQueryFn(getIncomeSetupStatusServerFn),
	});
}
