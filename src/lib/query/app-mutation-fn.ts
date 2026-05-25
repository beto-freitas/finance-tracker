import type { SuccessResponse } from "../server-fn/create-success-response";
import { appQueryToastHandler } from "./app-query-toast-handler";

type UnwrappedFn<TFn> = TFn extends (
	...args: infer TArgs
) => Promise<SuccessResponse<infer TData>>
	? (...args: TArgs) => Promise<TData>
	: never;

export function appMutationFn<
	TFn extends (...args: never[]) => Promise<SuccessResponse<unknown>>,
>(mutationFn: TFn): UnwrappedFn<TFn> {
	const wrapped = async (...args: Parameters<TFn>) => {
		try {
			const result = await mutationFn(...args);
			appQueryToastHandler(result, "success");
			return result.data;
		} catch (error) {
			appQueryToastHandler(error, "error");
			throw error;
		}
	};

	return wrapped as UnwrappedFn<TFn>;
}
