import { describe, expect, it } from "vitest";
import { computeExpectedSettledMinorFx } from "./compute-expected-settled";
import { computeEffectiveRateMinor } from "./effective-exchange-rate";

describe("FX rate and settled amount", () => {
	it("computes effective rate with spread (5.00 × 0.997 → 4.99 minor)", () => {
		expect(computeEffectiveRateMinor(500, 30)).toBe(499);
	});

	it("computes expected settled for $1,000 nominal at ~4.99 BRL/USD", () => {
		expect(computeExpectedSettledMinorFx(100_000, 500, 30)).toBe(499_000);
	});
});
