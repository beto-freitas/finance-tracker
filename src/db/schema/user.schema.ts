import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "../utils";

export const user = sqliteTable("user", {
	id,
	email: text().notNull().unique(),
	name: text().notNull(),
	emailVerified: integer({ mode: "boolean" }).notNull().default(false),
	image: text(),
	currency: text().notNull().default("USD"),
	...timestamps,
});
