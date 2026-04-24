import { integer, text } from "drizzle-orm/sqlite-core";

export const id = text()
	.primaryKey()
	.$defaultFn(() => crypto.randomUUID());

export const timestamps = {
	createdAt: integer({ mode: "timestamp" as const })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer({ mode: "timestamp" as const })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date()),
};
