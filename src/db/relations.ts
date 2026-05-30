import { defineRelations } from "drizzle-orm";
import * as schemas from "./schemas";

export const relations = defineRelations(schemas, (r) => ({
	user: {
		sessions: r.many.session(),
		accounts: r.many.account(),
		cashAccounts: r.many.cashAccount(),
	},
	session: {
		user: r.one.user({
			from: r.session.userId,
			to: r.user.id,
		}),
	},
	account: {
		user: r.one.user({
			from: r.account.userId,
			to: r.user.id,
		}),
	},
	cashAccount: {
		// TODO: set optional: false & only create user after full onboarding complete
		user: r.one.user({
			from: r.cashAccount.userId,
			to: r.user.id,
		}),
	},
}));
