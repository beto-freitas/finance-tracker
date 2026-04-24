import {
	type MutationKey,
	mutationOptions,
	type QueryFunctionContext,
	type QueryKey,
	queryOptions,
} from "@tanstack/react-query";
import type { ApiResponse, JsonValue } from "#/lib/api-response";
import type { HttpStatusCode } from "#/lib/http-status";

export class ApiClientError extends Error {
	code: HttpStatusCode;
	details?: unknown;

	constructor({
		code,
		message,
		details,
	}: {
		code: HttpStatusCode;
		message: string;
		details?: unknown;
	}) {
		super(message);
		this.name = "ApiClientError";
		this.code = code;
		this.details = details;
	}
}

export function unwrapApiResponse<TData extends JsonValue | undefined>(
	response: ApiResponse<TData>,
) {
	if (response.success) {
		return response.data;
	}

	throw new ApiClientError({
		code: response.error.code,
		message: response.error.message,
		details: response.error.details,
	});
}

export function createAppMutationOptions<
	TInput,
	TData extends JsonValue | undefined = undefined,
	TMutationKey extends MutationKey = MutationKey,
>(options: {
	mutationKey: TMutationKey;
	mutationFn: (input: TInput) => Promise<unknown>;
}) {
	return mutationOptions({
		mutationKey: options.mutationKey,
		mutationFn: async (input: TInput) => {
			const response = (await options.mutationFn(input)) as ApiResponse<TData>;
			return unwrapApiResponse(response);
		},
	});
}

export function createAppQueryOptions<
	TData extends JsonValue | undefined,
	TQueryKey extends QueryKey = QueryKey,
>(options: {
	queryKey: TQueryKey;
	queryFn: (context: QueryFunctionContext<TQueryKey>) => Promise<unknown>;
}) {
	return queryOptions({
		queryKey: options.queryKey,
		queryFn: async (context: QueryFunctionContext<TQueryKey>) => {
			const response = (await options.queryFn(context)) as ApiResponse<TData>;
			return unwrapApiResponse(response);
		},
	});
}
