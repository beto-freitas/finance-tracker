import { HTTP_STATUS, type HTTPStatus } from "../http-status";

export type SuccessResponse<TData> = {
	data?: TData;
	message?: string;
	status: HTTPStatus;
};

export function createSuccessResponse<TData>(params?: {
	data?: TData;
	message?: string;
	status?: HTTPStatus;
}): SuccessResponse<TData> {
	return {
		data: params?.data,
		message: params?.message,
		status: params?.status ?? HTTP_STATUS.OK,
	};
}
