import { AppError } from "#/lib/errors/app-error";

export class SettlementPlatformNotFoundError extends AppError {
	constructor() {
		super({ message: "Settlement platform not found" });
	}
}

export class SettlementPlatformInUseError extends AppError {
	constructor(sourceCount: number, receiptCount: number) {
		const parts: string[] = [];
		if (sourceCount > 0) {
			parts.push(`${sourceCount} income source${sourceCount === 1 ? "" : "s"}`);
		}
		if (receiptCount > 0) {
			parts.push(
				`${receiptCount} income receipt${receiptCount === 1 ? "" : "s"}`,
			);
		}
		super({
			message: `Cannot delete: still used by ${parts.join(" and ")}. Remove links first.`,
		});
	}
}
