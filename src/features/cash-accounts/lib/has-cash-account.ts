import { getFirstCashAccount } from "./get-first-cash-account";

/** Whether the user has a cash account (required before income mutations). */
export async function hasCashAccount(userId: string): Promise<boolean> {
	const cashAccount = await getFirstCashAccount(userId);
	return cashAccount != null;
}
