import * as s from "drizzle-orm/sqlite-core";
import * as u from "#/lib/db/utils";
import { incomeSourceIdColumn } from "./income-source-schema";
import { settlementPlatformIdColumn } from "./settlement-platform-schema";
import { userIdColumn } from "./user-schema";

export const incomeReceiptStatuses = [
	"expected",
	"received",
	"cancelled",
] as const;

export type IncomeReceiptStatus = (typeof incomeReceiptStatuses)[number];

export const incomeReceipt = s.sqliteTable(
	"income_receipt",
	{
		id: u.idColumn(),
		status: s
			.text("status", {
				enum: incomeReceiptStatuses,
			})
			.notNull(),
		expectedDate: s.text("expected_date").notNull(),
		actualDate: s.text("actual_date"),
		nominalMinor: s.integer("nominal_minor"),
		expectedSettledMinor: s.integer("expected_settled_minor").notNull(),
		expectedSettledOverrideMinor: s.integer("expected_settled_override_minor"),
		actualSettledMinor: s.integer("actual_settled_minor"),
		invoiceDate: s.text("invoice_date"),

		incomeSourceId: incomeSourceIdColumn(),
		settlementPlatformId: settlementPlatformIdColumn(),
		userId: userIdColumn(),
		...u.timestampsColumns(),
	},
	(table) => [
		s.index("income_receipt_userId_idx").on(table.userId),
		s.index("income_receipt_incomeSourceId_idx").on(table.incomeSourceId),
		s.index("income_receipt_expectedDate_idx").on(table.expectedDate),
		s
			.index("income_receipt_user_status_expectedDate_idx")
			.on(table.userId, table.status, table.expectedDate),
	],
);
