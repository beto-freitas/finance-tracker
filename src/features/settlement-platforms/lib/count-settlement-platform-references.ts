import { and, count, eq } from "drizzle-orm";
import { db } from "#/db";
import { incomeReceipt, incomeSource } from "#/db/schemas";

export async function countSettlementPlatformReferences(
	userId: string,
	settlementPlatformId: string,
): Promise<{ sourceCount: number; receiptCount: number }> {
	const [sourceRow, receiptRow] = await Promise.all([
		db
			.select({ count: count() })
			.from(incomeSource)
			.where(
				and(
					eq(incomeSource.userId, userId),
					eq(incomeSource.settlementPlatformId, settlementPlatformId),
				),
			),
		db
			.select({ count: count() })
			.from(incomeReceipt)
			.where(
				and(
					eq(incomeReceipt.userId, userId),
					eq(incomeReceipt.settlementPlatformId, settlementPlatformId),
				),
			),
	]);

	return {
		sourceCount: sourceRow[0]?.count ?? 0,
		receiptCount: receiptRow[0]?.count ?? 0,
	};
}
