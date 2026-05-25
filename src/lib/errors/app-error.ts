import { HTTP_STATUS, type HTTPStatus } from "../http-status";

export class AppError extends Error {
	readonly status?: HTTPStatus;
	readonly code?: string;

	constructor({
		message,
		status = HTTP_STATUS.INTERNAL_SERVER_ERROR,
		code,
	}: {
		message?: string;
		status?: HTTPStatus;
		code?: string;
	}) {
		super(message ?? "An unexpected error occurred");
		this.name = "AppError";
		this.code = code;
		this.status = status;
	}
}
