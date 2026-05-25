import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth.ts";
import { appQueryFn } from "#/lib/query/app-query-fn";
import { createSuccessResponse } from "#/lib/server-fn/create-success-response";

const getSessionServerFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const headers = getRequestHeaders();
		const result = await auth.api.getSession({ headers });

		return createSuccessResponse({ data: result });
	},
);

export function sessionQueryOptions() {
	return queryOptions({
		queryKey: ["auth", "session"],
		queryFn: appQueryFn(() => getSessionServerFn()),
	});
}
