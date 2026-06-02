import { describe, expect, it } from "vitest";

import { computeExpectedDates } from "./compute-expected-date";

describe("computeExpectedDates", () => {
	it("applies weekend shift then payment lag (salary scenario)", () => {
		const { year, monthIndex } = { year: 2026, monthIndex: 8 };
		const result = computeExpectedDates(year, monthIndex, 5, 3);
		expect(result.invoiceDate).toBe("2026-09-07");
		expect(result.expectedDate).toBe("2026-09-10");
	});
});
