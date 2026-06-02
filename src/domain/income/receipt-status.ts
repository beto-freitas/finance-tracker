import type { IncomeReceiptStatus } from "#/db/schemas/income-receipt-schema";

export function isOverdueReceipt(
	status: IncomeReceiptStatus,
	expectedDate: string,
	todayIso: string,
): boolean {
	return status === "expected" && expectedDate < todayIso;
}
