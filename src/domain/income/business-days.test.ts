import { describe, expect, it } from "vitest";

import { addBusinessDays, shiftToNextBusinessDay } from "./business-days";

describe("business-days", () => {
	it("shiftToNextBusinessDay moves Saturday forward to Monday", () => {
		expect(shiftToNextBusinessDay("2026-09-05")).toBe("2026-09-07");
	});

	it("addBusinessDays counts lag in business days from shifted invoice date", () => {
		expect(addBusinessDays("2026-09-07", 3)).toBe("2026-09-10");
	});

	it("addBusinessDays with zero lag returns shifted invoice date", () => {
		expect(addBusinessDays("2026-05-05", 0)).toBe("2026-05-05");
	});
});
