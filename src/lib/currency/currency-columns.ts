import * as s from "drizzle-orm/sqlite-core";
import {
	FX_INCOME_CURRENCIES,
	SUPPORTED_CURRENCIES,
} from "./currencies";

/** Any currency the app supports (e.g. income source in BRL or USD). */
export const supportedCurrencyColumn = (name = "income_currency") =>
	s.text(name, { enum: SUPPORTED_CURRENCIES }).notNull();

/** FX-only income currency for settlement platforms (excludes cash currency). */
export const fxIncomeCurrencyColumn = (name = "income_currency") =>
	s.text(name, { enum: FX_INCOME_CURRENCIES }).notNull();
