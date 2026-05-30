import { describe, expect, it } from "vitest";

import { todayIsoDate, toIsoDate } from "#/lib/date/iso-date";

describe("iso-date", () => {
	it("toIsoDate returns a 10-character YYYY-MM-DD string", () => {
		const result = toIsoDate(new Date("2026-05-28T15:30:00.000Z"));
		expect(result).toHaveLength(10);
		expect(result).toBe("2026-05-28");
	});

	it("todayIsoDate matches YYYY-MM-DD pattern", () => {
		expect(todayIsoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});
});
