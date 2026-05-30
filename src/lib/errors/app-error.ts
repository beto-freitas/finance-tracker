import { HTTP_STATUS, type HTTPStatus } from "../server-fn/http-status";

export class AppError extends Error {
	readonly status?: HTTPStatus;

	constructor({
		message,
		status = HTTP_STATUS.INTERNAL_SERVER_ERROR,
	}: {
		message?: string;
		status?: HTTPStatus;
	}) {
		super(message ?? "An unexpected error occurred");
		this.name = "AppError";
		this.status = status;
	}
}
