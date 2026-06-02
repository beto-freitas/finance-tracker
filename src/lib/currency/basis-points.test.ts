import { describe, expect, it } from "vitest";
import {
	basisPointsToSpreadPercentMajor,
	spreadPercentMajorToBasisPoints,
} from "./basis-points";

describe("basis-points boundary", () => {
	it("round-trips spread percent and basis points", () => {
		expect(spreadPercentMajorToBasisPoints(0.3)).toBe(30);
		expect(basisPointsToSpreadPercentMajor(30)).toBe(0.3);
	});
});
