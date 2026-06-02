import { sql } from "drizzle-orm";
import * as s from "drizzle-orm/sqlite-core";
import {
	FX_INCOME_CURRENCIES,
	SUPPORTED_CURRENCIES,
} from "../currency/currencies";

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

/** Any currency the app supports (e.g. income source in BRL or USD). */
export const supportedCurrencyColumn = (name = "income_currency") =>
	s.text(name, { enum: SUPPORTED_CURRENCIES }).notNull();

/** FX-only income currency for settlement platforms (excludes cash currency). */
export const fxIncomeCurrencyColumn = (name = "income_currency") =>
	s.text(name, { enum: FX_INCOME_CURRENCIES }).notNull();
