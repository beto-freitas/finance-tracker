import {
	index,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./utils";

export const user = sqliteTable("user", {
	id,
	email: text().notNull().unique(),
	name: text().notNull(),
	emailVerified: integer({ mode: "boolean" }).notNull().default(false),
	image: text(),
	currency: text().notNull().default("USD"),
	...timestamps,
});

export const session = sqliteTable(
	"session",
	{
		id,
		expiresAt: integer({ mode: "timestamp" }).notNull(),
		token: text().notNull().unique(),
		ipAddress: text(),
		userAgent: text(),
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		...timestamps,
	},
	(table) => [index("session_user_id_idx").on(table.userId)],
);

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

export const expenses = sqliteTable("expenses", {
	id,
	userId: text().notNull(),
	description: text().notNull(),
	amount: real().notNull(),
	date: integer({ mode: "timestamp" }).notNull(),
	...timestamps,
});
