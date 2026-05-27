import { afterEach, describe, expect, it, vi } from "vitest";

import {
	calendarPartsToIso,
	digitsToIso,
	displayToIso,
	extractDateParts,
	formatDisplayWhileTyping,
	formatIsoToDisplay,
	getDateDisplayMeta,
	resolveDateLocale,
} from "#/lib/form/date-display.ts";

describe("resolveDateLocale", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("falls back to pt-BR when navigator is unavailable", () => {
		vi.stubGlobal("navigator", undefined);
		expect(resolveDateLocale()).toBe("pt-BR");
		expect(getDateDisplayMeta().order).toBe("dmy");
		expect(getDateDisplayMeta().placeholder).toBe("DD/MM/YYYY");
	});
});

describe("getDateDisplayMeta", () => {
	it("uses dmy order for en-GB", () => {
		expect(getDateDisplayMeta("en-GB").order).toBe("dmy");
		expect(getDateDisplayMeta("en-GB").placeholder).toBe("DD/MM/YYYY");
	});

	it("uses mdy order for en-US", () => {
		expect(getDateDisplayMeta("en-US").order).toBe("mdy");
		expect(getDateDisplayMeta("en-US").placeholder).toBe("MM/DD/YYYY");
	});
});

describe("extractDateParts / calendarPartsToIso", () => {
	it("maps en-GB digit order to day-month-year", () => {
		expect(extractDateParts("20112003", "dmy")).toEqual({
			day: 20,
			month: 11,
			year: 2003,
		});
	});

	it("maps en-US digit order to month-day-year", () => {
		expect(extractDateParts("11202003", "mdy")).toEqual({
			month: 11,
			day: 20,
			year: 2003,
		});
	});

	it("rejects invalid calendar days", () => {
		expect(calendarPartsToIso({ day: 31, month: 2, year: 2025 })).toBeNull();
	});
});

describe("digitsToIso / displayToIso", () => {
	it("round-trips en-GB display", () => {
		const iso = "2025-05-25";
		const display = formatIsoToDisplay(iso, "en-GB");
		expect(display).toBe("25/05/2025");
		expect(displayToIso(display, "en-GB")).toBe(iso);
	});

	it("round-trips en-US display", () => {
		const iso = "2025-05-25";
		const display = formatIsoToDisplay(iso, "en-US");
		expect(display).toBe("05/25/2025");
		expect(displayToIso(display, "en-US")).toBe(iso);
	});

	it("returns null for incomplete input", () => {
		expect(displayToIso("25/05", "en-GB")).toBeNull();
	});

	it("does not parse a partial year", () => {
		expect(displayToIso("11/20/2", "en-US")).toBeNull();
		expect(displayToIso("11/20/20", "en-US")).toBeNull();
	});

	it("parses 20112003 as 20 Nov 2003 under en-GB", () => {
		expect(digitsToIso("20112003", "en-GB")).toBe("2003-11-20");
		expect(
			displayToIso(formatDisplayWhileTyping("20112003", "en-GB"), "en-GB"),
		).toBe("2003-11-20");
	});

	it("rejects 20112003 under en-US (month 20 in MDY order)", () => {
		expect(digitsToIso("20112003", "en-US")).toBeNull();
		expect(
			displayToIso(formatDisplayWhileTyping("20112003", "en-US"), "en-US"),
		).toBeNull();
	});

	it("parses 11202003 as Nov 20 2003 under en-US", () => {
		expect(digitsToIso("11202003", "en-US")).toBe("2003-11-20");
		expect(displayToIso("11/20/2003", "en-US")).toBe("2003-11-20");
	});

	it("rejects invalid en-GB calendar date 31/02/2025", () => {
		expect(digitsToIso("31022025", "en-GB")).toBeNull();
		expect(displayToIso("31/02/2025", "en-GB")).toBeNull();
	});
});

describe("formatDisplayWhileTyping", () => {
	it("inserts separators for en-GB as digits are entered", () => {
		expect(formatDisplayWhileTyping("25052025", "en-GB")).toBe("25/05/2025");
	});
});
