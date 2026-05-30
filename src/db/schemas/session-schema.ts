import * as s from "drizzle-orm/sqlite-core";
import * as u from "#/lib/db/utils";
import { userIdColumn } from "./user-schema";

export const session = s.sqliteTable(
	"session",
	{
		id: u.idColumn(),
		expiresAt: s.integer("expires_at", { mode: "timestamp_ms" }).notNull(),
		token: s.text("token").notNull().unique(),
		ipAddress: s.text("ip_address"),
		userAgent: s.text("user_agent"),

		userId: userIdColumn(),
		...u.timestampsColumns(),
	},
	(table) => [s.index("session_userId_idx").on(table.userId)],
);
