import { describe, expect, it } from "vitest";

import { isOverdueReceipt } from "./receipt-status";

describe("isOverdueReceipt", () => {
	it("flags expected receipts before today", () => {
		expect(isOverdueReceipt("expected", "2026-01-01", "2026-05-31")).toBe(true);
	});

	it("does not flag received receipts", () => {
		expect(isOverdueReceipt("received", "2026-01-01", "2026-05-31")).toBe(false);
	});
});
