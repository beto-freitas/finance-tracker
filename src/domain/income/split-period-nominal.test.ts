import { describe, expect, it } from "vitest";

import { splitPeriodNominalMinor } from "./split-period-nominal";

describe("splitPeriodNominalMinor", () => {
	it("splits $2,000 monthly across two rules equally", () => {
		expect(splitPeriodNominalMinor(200_000, 2)).toEqual([100_000, 100_000]);
	});
});
