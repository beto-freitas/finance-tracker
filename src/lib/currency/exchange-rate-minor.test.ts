import { describe, expect, it } from "vitest";
import { computeEffectiveRateMinor } from "#/domain/income/effective-exchange-rate";
import {
	assumedBaseRateMajorToMinor,
	assumedBaseRateMinorToMajor,
	effectiveRateMinorToMajor,
} from "./exchange-rate-minor";

describe("exchange-rate-minor boundary", () => {
	it("round-trips assumed base rate major and minor", () => {
		expect(assumedBaseRateMajorToMinor(5)).toBe(500);
		expect(assumedBaseRateMinorToMajor(500)).toBe(5);
	});

	it("maps effective rate minor to major (5.00 × 0.997 → 4.99 at 2dp storage)", () => {
		const minor = computeEffectiveRateMinor(500, 30);
		expect(minor).toBe(499);
		expect(effectiveRateMinorToMajor(minor)).toBe(4.99);
	});
});
