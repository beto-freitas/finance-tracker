import {
	index,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { id, timestamps } from "../utils";
import { user } from "./user.schema";

export const expenses = sqliteTable(
	"expenses",
	{
		id,
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		description: text().notNull(),
		amount: real().notNull(),
		date: integer({ mode: "timestamp" }).notNull(),
		...timestamps,
	},
	(table) => [index("expenses_user_id_idx").on(table.userId)],
);
