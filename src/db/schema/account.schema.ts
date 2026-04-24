import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "../utils";
import { user } from "./user.schema";

export const account = sqliteTable(
	"account",
	{
		id,
		accountId: text().notNull(),
		providerId: text().notNull(),
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text(),
		refreshToken: text(),
		idToken: text(),
		accessTokenExpiresAt: integer({ mode: "timestamp" }),
		refreshTokenExpiresAt: integer({ mode: "timestamp" }),
		scope: text(),
		password: text(),
		...timestamps,
	},
	(table) => [index("account_user_id_idx").on(table.userId)],
);
