import { CashAccountRequiredError } from "./cash-account-errors";
import { getFirstCashAccount } from "./get-first-cash-account";

/** Returns the user's cash account or throws if none exists. */
export async function requireCashAccount(userId: string) {
	const cashAccount = await getFirstCashAccount(userId);
	if (!cashAccount) {
		throw new CashAccountRequiredError();
	}
	return cashAccount;
}
