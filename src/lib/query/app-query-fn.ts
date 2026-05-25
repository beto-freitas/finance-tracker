import type { SuccessResponse } from "../server-fn/create-success-response";
import { appQueryToastHandler } from "./app-query-toast-handler";

export function appQueryFn<TData>(
	queryFn: () => Promise<SuccessResponse<TData>>,
) {
	return async () => {
		try {
			const result = await queryFn();
			appQueryToastHandler(result, "success");
			return (result.data ?? null) as TData;
		} catch (error) {
			appQueryToastHandler(error, "error");
			throw error;
		}
	};
}
