import { HTTP_STATUS, type HttpStatusCode } from "#/lib/http-status";

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

export type CreateErrorResponseOptions = {
	knownErrorCode: HttpStatusCode;
	fallbackMessage: string;
	fallbackCode?: HttpStatusCode;
	details?: JsonValue;
};

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
): ApiErrorResponse;
export function createErrorResponse(
	error: unknown,
	options: CreateErrorResponseOptions,
): ApiErrorResponse;
export function createErrorResponse(
	codeOrError: HttpStatusCode | unknown,
	messageOrOptions: string | CreateErrorResponseOptions,
	details?: JsonValue,
): ApiErrorResponse {
	if (typeof messageOrOptions === "object") {
		if (codeOrError instanceof Error) {
			return buildErrorResponse(
				messageOrOptions.knownErrorCode,
				codeOrError.message,
				messageOrOptions.details,
			);
		}

		return buildErrorResponse(
			messageOrOptions.fallbackCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR,
			messageOrOptions.fallbackMessage,
			messageOrOptions.details,
		);
	}

	return buildErrorResponse(
		codeOrError as HttpStatusCode,
		messageOrOptions,
		details,
	);
}

function buildErrorResponse(
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
