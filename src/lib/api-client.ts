import {
	type MutationKey,
	mutationOptions,
	type QueryFunctionContext,
	type QueryKey,
	queryOptions,
} from "@tanstack/react-query";
import type { ApiResponse, JsonValue } from "#/lib/api-response";
import { HTTP_STATUS, type HttpStatusCode } from "#/lib/http-status";

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

const MAX_RETRY_COUNT = 3;

type AppQueryOverrides = {
	throwOnError?: boolean;
	retry?: (retryCount: number, error: unknown) => boolean;
};

function createDefaultQueryRetry(retryCount: number, error: unknown) {
	if (
		error instanceof ApiClientError &&
		error.code === HTTP_STATUS.UNAUTHORIZED
	) {
		return false;
	}

	return retryCount < MAX_RETRY_COUNT;
}

export function createAppQueryOptions<
	TData extends JsonValue | undefined,
	TQueryKey extends QueryKey = QueryKey,
>(options: {
	queryKey: TQueryKey;
	queryFn: (
		context: QueryFunctionContext<TQueryKey>,
	) => Promise<ApiResponse<TData>>;
	overrides?: AppQueryOverrides;
}) {
	return queryOptions({
		queryKey: options.queryKey,
		queryFn: async (context: QueryFunctionContext<TQueryKey>) => {
			const response = await options.queryFn(context);
			return unwrapApiResponse(response);
		},
		throwOnError: options.overrides?.throwOnError ?? true,
		retry: options.overrides?.retry ?? createDefaultQueryRetry,
	});
}
