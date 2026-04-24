import { relations } from "drizzle-orm";
import { account } from "./account.schema";
import { expenses } from "./expenses.schema";
import { session } from "./session.schema";
import { user } from "./user.schema";

export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	expenses: many(expenses),
	sessions: many(session),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
	user: one(user, {
		fields: [expenses.userId],
		references: [user.id],
	}),
}));
