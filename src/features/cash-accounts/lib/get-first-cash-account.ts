import { db } from "#/db";
import "@tanstack/react-start/server";

export const getFirstCashAccount = async (
	userId: string,
	cashAccountId?: string,
) => {
	const cashAccount = await db.query.cashAccount.findFirst({
		where: {
			userId,
			...(cashAccountId ? { id: cashAccountId } : {}),
		},
	});

	return cashAccount;
};
