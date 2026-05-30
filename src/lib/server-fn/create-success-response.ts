import { HTTP_STATUS, type HTTPStatus } from "./http-status";

export type SuccessResponse<TData> = {
	data?: TData;
	message?: string;
	status: HTTPStatus;
};

export function createSuccessResponse<TData = null>(params?: {
	data?: TData;
	message?: string;
	status?: HTTPStatus;
}): SuccessResponse<TData> {
	return {
		// collapsed to null. useQuery doesn't like undefined as data type.
		data: params?.data ?? (null as TData),
		message: params?.message,
		status: params?.status ?? HTTP_STATUS.OK,
	};
}
