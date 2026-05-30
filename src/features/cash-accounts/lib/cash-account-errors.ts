import { AppError } from "#/lib/errors/app-error";

export class ExistingCashAccountError extends AppError {
	constructor() {
		super({
			message: "You already have a cash account",
		});
	}
}

export class CashAccountNotFoundError extends AppError {
	constructor() {
		super({
			message: "Cash account not found",
		});
	}
}
