import { defineRelations } from "drizzle-orm";
import * as schemas from "./schemas";

export const relations = defineRelations(schemas, (r) => ({
	user: {
		sessions: r.many.session(),
		accounts: r.many.account(),
		cashAccounts: r.many.cashAccount(),
		settlementPlatforms: r.many.settlementPlatform(),
		incomeSources: r.many.incomeSource(),
		incomeReceipts: r.many.incomeReceipt(),
	},
	session: {
		user: r.one.user({
			from: r.session.userId,
			to: r.user.id,
			optional: false,
		}),
	},
	account: {
		user: r.one.user({
			from: r.account.userId,
			to: r.user.id,
			optional: false,
		}),
	},
	cashAccount: {
		// TODO: set optional: false & only create user after full onboarding complete
		user: r.one.user({
			from: r.cashAccount.userId,
			to: r.user.id,
			optional: false,
		}),
	},
	settlementPlatform: {
		user: r.one.user({
			from: r.settlementPlatform.userId,
			to: r.user.id,
			optional: false,
		}),
		incomeSources: r.many.incomeSource(),
		incomeReceipts: r.many.incomeReceipt(),
	},
	incomeSource: {
		user: r.one.user({
			from: r.incomeSource.userId,
			to: r.user.id,
			optional: false,
		}),
		settlementPlatform: r.one.settlementPlatform({
			from: r.incomeSource.settlementPlatformId,
			to: r.settlementPlatform.id,
			optional: true,
		}),
		occurrenceRules: r.many.incomeSourceOccurrenceRule(),
		incomeReceipts: r.many.incomeReceipt(),
	},
	incomeSourceOccurrenceRule: {
		incomeSource: r.one.incomeSource({
			from: r.incomeSourceOccurrenceRule.incomeSourceId,
			to: r.incomeSource.id,
			optional: false,
		}),
	},
	incomeReceipt: {
		user: r.one.user({
			from: r.incomeReceipt.userId,
			to: r.user.id,
			optional: false,
		}),
		incomeSource: r.one.incomeSource({
			from: r.incomeReceipt.incomeSourceId,
			to: r.incomeSource.id,
			optional: true,
		}),
		settlementPlatform: r.one.settlementPlatform({
			from: r.incomeReceipt.settlementPlatformId,
			to: r.settlementPlatform.id,
			optional: true,
		}),
	},
}));
