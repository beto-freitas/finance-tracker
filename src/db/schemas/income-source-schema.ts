import * as s from "drizzle-orm/sqlite-core";
import { supportedCurrencyColumn } from "#/lib/currency/currency-columns";
import * as u from "#/lib/db/utils";
import { settlementPlatformIdColumn } from "./settlement-platform-schema";
import { userIdColumn } from "./user-schema";

export const incomeSource = s.sqliteTable(
	"income_source",
	{
		id: u.idColumn(),
		name: s.text("name").notNull(),
		incomeCurrency: supportedCurrencyColumn(),
		settlementPlatformId: settlementPlatformIdColumn(),
		monthlyTotalMinor: s.integer("monthly_total_minor").notNull(),
		paymentLagBusinessDays: s.integer("payment_lag_business_days").notNull(),
		endDate: s.text("end_date"),

		userId: userIdColumn(),
		...u.timestampsColumns(),
	},
	(table) => [
		s.index("income_source_userId_idx").on(table.userId),
		s.index("income_source_settlementPlatformId_idx").on(
			table.settlementPlatformId,
		),
	],
);

export const incomeSourceIdColumn = (
	onDelete: s.UpdateDeleteAction = "cascade",
) =>
	s
		.text("income_source_id")
		.references(() => incomeSource.id, { onDelete });
