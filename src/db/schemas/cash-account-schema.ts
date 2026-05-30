import * as s from "drizzle-orm/sqlite-core";
import * as u from "#/lib/db/utils";
import { userIdColumn } from "./user-schema";

export const cashAccount = s.sqliteTable(
	"cash_account",
	{
		id: u.idColumn(),
		name: s.text("name").notNull(),
		balanceMinor: s.integer("balance_minor").notNull(),
		balanceAsOfDate: s.text("balance_as_of_date").notNull(),

		userId: userIdColumn(),
		...u.timestampsColumns(),
	},
	(table) => [
		s.index("cash_account_userId_idx").on(table.userId),
		s.uniqueIndex("cash_account_userId_unique").on(table.userId),
	],
);
