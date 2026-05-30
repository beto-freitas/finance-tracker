import * as s from "drizzle-orm/sqlite-core";
import * as u from "#/lib/db/utils";

export const user = s.sqliteTable("user", {
	id: u.idColumn(),
	name: s.text("name").notNull(),
	email: s.text("email").notNull().unique(),
	emailVerified: s
		.integer("email_verified", { mode: "boolean" })
		.default(false)
		.notNull(),
	image: s.text("image"),

	...u.timestampsColumns(),
});

export const userIdColumn = (onDelete: s.UpdateDeleteAction = "cascade") =>
	s
		.text("user_id")
		.notNull()
		.references(() => user.id, { onDelete });
