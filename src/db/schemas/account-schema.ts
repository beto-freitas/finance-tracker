import * as s from "drizzle-orm/sqlite-core";
import * as u from "#/lib/db/utils";
import { userIdColumn } from "./user-schema";

export const account = s.sqliteTable(
	"account",
	{
		id: u.idColumn(),
		accountId: s.text("account_id").notNull(),
		providerId: s.text("provider_id").notNull(),
		accessToken: s.text("access_token"),
		refreshToken: s.text("refresh_token"),
		idToken: s.text("id_token"),
		accessTokenExpiresAt: s.integer("access_token_expires_at", {
			mode: "timestamp_ms",
		}),
		refreshTokenExpiresAt: s.integer("refresh_token_expires_at", {
			mode: "timestamp_ms",
		}),
		scope: s.text("scope"),
		password: s.text("password"),

		userId: userIdColumn(),
		...u.timestampsColumns(),
	},
	(table) => [s.index("account_userId_idx").on(table.userId)],
);
