import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { appQueryFn } from "#/lib/query/app-query-fn";
import { createSuccessResponse } from "#/lib/server-fn/create-success-response";
import { getAuthSessionServerFn } from "../lib/get-auth-session";

const getSessionServerFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const result = await getAuthSessionServerFn();

		return createSuccessResponse({ data: result });
	},
);

export function sessionQueryOptions() {
	return queryOptions({
		queryKey: ["auth", "session"],
		queryFn: appQueryFn(() => getSessionServerFn()),
	});
}
