import type { HttpStatusCode } from "#/lib/http-status";

export type ApiError = {
	code: HttpStatusCode;
	message: string;
	details?: JsonValue;
};

type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
	| JsonPrimitive
	| JsonValue[]
	| { [key: string]: JsonValue | undefined };

export type ApiSuccessResponse<
	TData extends JsonValue | undefined = undefined,
> = {
	success: true;
	data?: TData;
	meta?: { [key: string]: JsonValue | undefined };
};

export type ApiErrorResponse = {
	success: false;
	error: ApiError;
};

export type ApiResponse<TData extends JsonValue | undefined = undefined> =
	| ApiSuccessResponse<TData>
	| ApiErrorResponse;

export function createSuccessResponse<
	TData extends JsonValue | undefined = undefined,
>(
	data?: TData,
	meta?: { [key: string]: JsonValue | undefined },
): ApiSuccessResponse<TData> {
	return {
		success: true,
		data,
		meta,
	};
}

export function createErrorResponse(
	code: HttpStatusCode,
	message: string,
	details?: JsonValue,
): ApiErrorResponse {
	return {
		success: false,
		error: {
			code,
			message,
			details,
		},
	};
}
