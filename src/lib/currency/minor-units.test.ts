import { describe, expect, it } from "vitest";

import { fromMinorUnits, toMinorUnits } from "#/lib/currency/minor-units";

describe("minor-units", () => {
	it("converts major to minor units", () => {
		expect(toMinorUnits(1500)).toBe(150_000);
	});

	it("converts minor to major units", () => {
		expect(fromMinorUnits(150_000)).toBe(1500);
	});

	it("round-trips zero", () => {
		expect(fromMinorUnits(toMinorUnits(0))).toBe(0);
	});
});
