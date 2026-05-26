import { describe, expect, it } from "vitest";

import { toSelectOptions } from "#/lib/form/to-select-options.ts";

describe("toSelectOptions", () => {
	it("maps tuple values to value+label options", () => {
		const values = ["BRL", "USD"] as const;
		expect(toSelectOptions(values)).toEqual([
			{ value: "BRL", label: "BRL", searchText: undefined },
			{ value: "USD", label: "USD", searchText: undefined },
		]);
	});

	it("uses labels map for label and searchText", () => {
		const values = ["BRL", "USD"] as const;
		expect(
			toSelectOptions(values, { BRL: "Brazilian Real", USD: "US Dollar" }),
		).toEqual([
			{ value: "BRL", label: "Brazilian Real", searchText: "Brazilian Real" },
			{ value: "USD", label: "US Dollar", searchText: "US Dollar" },
		]);
	});
});
