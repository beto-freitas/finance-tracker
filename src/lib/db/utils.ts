import { sql } from "drizzle-orm";
import * as s from "drizzle-orm/sqlite-core";

export const idColumn = () =>
	s
		.text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID());

export const createdAtColumn = () =>
	s
		.integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull();

export const updatedAtColumn = () =>
	s
		.integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull();

export const timestampsColumns = () => ({
	createdAt: createdAtColumn(),
	updatedAt: updatedAtColumn(),
});
