import { HTTP_STATUS } from "../server-fn/http-status";
import { AppError } from "./app-error";

export class AppUnauthenticatedError extends AppError {
	constructor() {
		super({
			message: "Please log in to continue",
			status: HTTP_STATUS.UNAUTHORIZED,
		});
		this.name = "AppUnauthenticatedError";
	}
}
