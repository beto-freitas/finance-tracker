import * as s from "drizzle-orm/sqlite-core";
import * as u from "#/lib/db/utils";
import { userIdColumn } from "./user-schema";

export const settlementPlatform = s.sqliteTable(
	"settlement_platform",
	{
		id: u.idColumn(),
		name: s.text("name").notNull(),
		incomeCurrency: u.fxIncomeCurrencyColumn(),
		exchangeSpreadBasisPoints: s
			.integer("exchange_spread_basis_points")
			.notNull(),
		assumedBaseRateMinor: s.integer("assumed_base_rate_minor").notNull(),

		userId: userIdColumn(),
		...u.timestampsColumns(),
	},
	(table) => [s.index("settlement_platform_userId_idx").on(table.userId)],
);

export const settlementPlatformIdColumn = (
	onDelete: s.UpdateDeleteAction = "cascade",
) =>
	s
		.text("settlement_platform_id")
		.references(() => settlementPlatform.id, { onDelete });
