import { describe, expect, it } from "vitest";

import { materializeExpectedReceipts } from "./materialize-expected-receipts";

describe("materializeExpectedReceipts", () => {
	const baseInput = {
		incomeSourceId: "source-1",
		incomeCurrency: "USD" as const,
		cashCurrency: "BRL" as const,
		monthlyTotalMinor: 200_000,
		paymentLagBusinessDays: 3,
		endDate: null,
		settlementPlatformId: "platform-1",
		assumedBaseRateMinor: 500,
		exchangeSpreadBasisPoints: 30,
		occurrenceDayOfMonth: [5, 20],
	};

	it("materializes two rules × six months of expected receipts", () => {
		const drafts = materializeExpectedReceipts(baseInput, "2026-05-01", 6);
		expect(drafts).toHaveLength(12);
		expect(drafts.every((d) => d.status === "expected")).toBe(true);
		expect(drafts.every((d) => d.nominalMinor === 100_000)).toBe(true);
		expect(drafts.every((d) => d.expectedSettledMinor === 499_000)).toBe(true);
	});

	it("skips receipts after source end date", () => {
		const drafts = materializeExpectedReceipts(
			{ ...baseInput, endDate: "2026-05-15" },
			"2026-05-01",
			6,
		);
		expect(drafts.length).toBeGreaterThan(0);
		expect(drafts.every((d) => d.expectedDate <= "2026-05-15")).toBe(true);
	});
});
