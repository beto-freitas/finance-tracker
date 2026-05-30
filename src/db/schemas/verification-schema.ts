import * as s from "drizzle-orm/sqlite-core";
import * as u from "#/lib/db/utils";

export const verification = s.sqliteTable(
	"verification",
	{
		id: u.idColumn(),
		identifier: s.text("identifier").notNull(),
		value: s.text("value").notNull(),
		expiresAt: s.integer("expires_at", { mode: "timestamp_ms" }).notNull(),

		...u.timestampsColumns(),
	},
	(table) => [s.index("verification_identifier_idx").on(table.identifier)],
);
