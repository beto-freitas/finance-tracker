import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./utils";

export const users = sqliteTable("users", {
	id,
	email: text().notNull().unique(),
	password: text().notNull(),
	username: text().notNull(),
	...timestamps,
});

export const expenses = sqliteTable("expenses", {
	id,
	userId: text().notNull(),
	description: text().notNull(),
	amount: real().notNull(),
	date: integer({ mode: "timestamp" }).notNull(),
	...timestamps,
});
