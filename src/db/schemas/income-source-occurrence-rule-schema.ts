import * as s from "drizzle-orm/sqlite-core";
import * as u from "#/lib/db/utils";
import { incomeSourceIdColumn } from "./income-source-schema";

export const incomeSourceOccurrenceRule = s.sqliteTable(
	"income_source_occurrence_rule",
	{
		id: u.idColumn(),
		dayOfMonth: s.integer("day_of_month").notNull(),

		incomeSourceId: incomeSourceIdColumn().notNull(),
		...u.timestampsColumns(),
	},
	(table) => [
		s
			.uniqueIndex("income_source_occurrence_rule_source_day_unique")
			.on(table.incomeSourceId, table.dayOfMonth),
		s
			.index("income_source_occurrence_rule_incomeSourceId_idx")
			.on(table.incomeSourceId),
	],
);
