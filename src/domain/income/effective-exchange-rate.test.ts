import { describe, expect, it } from "vitest";
import { computeExpectedSettledMinorFx } from "./compute-expected-settled";
import { computeEffectiveRateScaled } from "./effective-exchange-rate";

describe("FX rate and settled amount", () => {
	it("computes effective rate with spread (5.00 × 0.997)", () => {
		expect(computeEffectiveRateScaled(50_000, 30)).toBe(49_850);
	});

	it("computes expected settled for $1,000 nominal at 4.985 BRL/USD", () => {
		expect(computeExpectedSettledMinorFx(100_000, 50_000, 30)).toBe(498_500);
	});
});
