import { describe, expect, it } from "vitest";

import { fieldNameToLabel } from "#/lib/form/field-name-to-label.ts";

describe("fieldNameToLabel", () => {
	it("splits camelCase into Title Case words", () => {
		expect(fieldNameToLabel("firstName")).toBe("First Name");
		expect(fieldNameToLabel("balanceMinor")).toBe("Balance Minor");
	});

	it("splits snake_case and kebab-case", () => {
		expect(fieldNameToLabel("as_of_date")).toBe("As Of Date");
		expect(fieldNameToLabel("cash-account")).toBe("Cash Account");
	});

	it("preserves digits as part of the word boundary", () => {
		expect(fieldNameToLabel("line1Amount")).toBe("Line1 Amount");
	});

	it("uses the last segment of a dotted path", () => {
		expect(fieldNameToLabel("user.email")).toBe("Email");
		expect(fieldNameToLabel("accounts[0].balanceMinor")).toBe("Balance Minor");
	});

	it("leaves a single capitalized word untouched", () => {
		expect(fieldNameToLabel("Email")).toBe("Email");
	});

	it("handles an empty string", () => {
		expect(fieldNameToLabel("")).toBe("");
	});
});
