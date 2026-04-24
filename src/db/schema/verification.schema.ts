import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "../utils";

export const verification = sqliteTable(
	"verification",
	{
		id,
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: integer({ mode: "timestamp" }).notNull(),
		...timestamps,
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);
