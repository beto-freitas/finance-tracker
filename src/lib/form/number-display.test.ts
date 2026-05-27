import { describe, expect, it } from "vitest";

import {
	applyBackspace,
	applyDigit,
	applyPaste,
	applyStep,
	editStateToValue,
	formatNumberToDisplay,
	valueToEditState,
} from "#/lib/form/number-display.ts";

const enUs = { locale: "en-US", maximumFractionDigits: 2 };
const deDe = { locale: "de-DE", maximumFractionDigits: 2 };

describe("formatNumberToDisplay", () => {
	it("formats 12.34 for en-US", () => {
		expect(formatNumberToDisplay(12.34, enUs)).toBe("12.34");
	});

	it("formats 12.34 for de-DE", () => {
		expect(formatNumberToDisplay(12.34, deDe)).toBe("12,34");
	});

	it("returns empty for undefined", () => {
		expect(formatNumberToDisplay(undefined, enUs)).toBe("");
	});

	it("formats zero as 0.00", () => {
		expect(formatNumberToDisplay(0, enUs)).toBe("0.00");
	});
});

describe("empty field end-typing", () => {
	it("types from empty with scale 0 inserts whole units", () => {
		const intOptions = { locale: "en-US", maximumFractionDigits: 0 };
		const state = valueToEditState(undefined, intOptions);
		const afterOne = applyDigit(state, 0, "1", intOptions);
		expect(afterOne.display).toBe("1");
		expect(afterOne.value).toBe(1);
	});

	it("types from empty with caret at end", () => {
		let state = valueToEditState(undefined, enUs);
		let gap = 0;

		const afterOne = applyDigit(state, gap, "1", enUs);
		expect(afterOne.display).toBe("0.01");
		expect(afterOne.caretDisplay).toBe("0.01".length);
		expect(afterOne.value).toBe(0.01);

		state = afterOne.state;
		gap = afterOne.caretGap;

		const afterTwo = applyDigit(state, gap, "2", enUs);
		expect(afterTwo.display).toBe("0.12");
		expect(afterTwo.caretDisplay).toBe("0.12".length);

		state = afterTwo.state;
		gap = afterTwo.caretGap;

		const afterThree = applyDigit(state, gap, "3", enUs);
		expect(afterThree.display).toBe("1.23");
		expect(afterThree.caretDisplay).toBe("1.23".length);

		state = afterThree.state;
		gap = afterThree.caretGap;

		const afterFour = applyDigit(state, gap, "4", enUs);
		expect(editStateToValue(afterFour.state)).toBe(12.34);
		expect(formatNumberToDisplay(afterFour.value, enUs)).toBe("12.34");
	});

	it('types "0" from empty into an explicit zero value', () => {
		const state = valueToEditState(undefined, enUs);
		const result = applyDigit(state, 0, "0", enUs);
		expect(result.display).toBe("0.00");
		expect(result.value).toBe(0);
	});

	it("backspaces a typed value to empty with caret at end", () => {
		let state = valueToEditState(1.23, enUs);
		let gap = state.digitString.length;

		const afterOne = applyBackspace(state, gap, enUs);
		expect(afterOne.display).toBe("0.12");
		expect(afterOne.caretDisplay).toBe("0.12".length);

		state = afterOne.state;
		gap = afterOne.caretGap;

		const afterTwo = applyBackspace(state, gap, enUs);
		expect(afterTwo.display).toBe("0.01");
		expect(afterTwo.caretDisplay).toBe("0.01".length);

		state = afterTwo.state;
		gap = afterTwo.caretGap;

		const afterThree = applyBackspace(state, gap, enUs);
		expect(afterThree.display).toBe("");
		expect(afterThree.value).toBeUndefined();
		expect(afterThree.caretDisplay).toBe(0);
	});
});

describe("editing existing value", () => {
	it("appends 56 at end of 12.34 into 1234.56", () => {
		let state = valueToEditState(12.34, enUs);
		let gap = state.digitString.length;
		for (const digit of "56") {
			const result = applyDigit(state, gap, digit, enUs);
			state = result.state;
			gap = result.caretGap;
		}
		expect(editStateToValue(state)).toBe(1234.56);
	});

	it("inserts 5 before decimal in 12.34 into 125.34", () => {
		const state = valueToEditState(12.34, enUs);
		const result = applyDigit(state, 2, "5", enUs);
		expect(result.value).toBe(125.34);
		expect(result.display).toBe("125.34");
	});

	it("inserts 5 before 2 in 12.34 into 152.34", () => {
		const state = valueToEditState(12.34, enUs);
		const result = applyDigit(state, 1, "5", enUs);
		expect(result.value).toBe(152.34);
		expect(result.display).toBe("152.34");
	});

	it("replaces a full selection with a new fixed-scale digit", () => {
		const state = valueToEditState(12.34, enUs);
		const result = applyDigit(state, 0, "5", enUs, {
			startGap: 0,
			endGap: state.digitString.length,
		});

		expect(result.display).toBe("0.05");
		expect(result.value).toBe(0.05);
		expect(result.caretDisplay).toBe("0.05".length);
	});

	it("clears a full selection with Backspace", () => {
		const state = valueToEditState(12.34, enUs);
		const result = applyBackspace(state, state.digitString.length, enUs, {
			startGap: 0,
			endGap: state.digitString.length,
		});

		expect(result.display).toBe("");
		expect(result.value).toBeUndefined();
		expect(result.caretDisplay).toBe(0);
	});
});

describe("applyPaste", () => {
	it("pastes 1234 with 2 fraction digits into 12.34", () => {
		const state = valueToEditState(undefined, enUs);
		const result = applyPaste(state, "1234", enUs);
		expect(result.value).toBe(12.34);
	});

	it("pastes 1234 with 0 fraction digits into 1234", () => {
		const intOptions = { locale: "en-US", maximumFractionDigits: 0 };
		const state = valueToEditState(undefined, intOptions);
		const result = applyPaste(state, "1234", intOptions);
		expect(result.value).toBe(1234);
		expect(result.display).toBe("1234");
	});

	it("pastes 1234 with 3 fraction digits into 1.234", () => {
		const threeFrac = { locale: "en-US", maximumFractionDigits: 3 };
		const state = valueToEditState(undefined, threeFrac);
		const result = applyPaste(state, "1234", threeFrac);
		expect(result.value).toBe(1.234);
	});

	it("pastes negative when allowed", () => {
		const state = valueToEditState(undefined, enUs);
		const result = applyPaste(state, "-1234", {
			...enUs,
			allowNegative: true,
		});
		expect(result.value).toBe(-12.34);
	});

	it("strips sign when negatives disallowed", () => {
		const state = valueToEditState(undefined, enUs);
		const result = applyPaste(state, "-1234", {
			...enUs,
			allowNegative: false,
		});
		expect(result.value).toBe(12.34);
	});
});

describe("applyStep", () => {
	it("steps empty up to 1", () => {
		const result = applyStep(undefined, 1, { ...enUs, step: 0.01 });
		expect(result.value).toBe(1);
		expect(result.display).toBe("1.00");
	});

	it("steps empty down to -1 when negatives allowed", () => {
		const result = applyStep(undefined, -1, { ...enUs, step: 0.01 });
		expect(result.value).toBe(-1);
	});

	it("steps empty down to 0 when negatives disallowed", () => {
		const result = applyStep(undefined, -1, {
			...enUs,
			step: 0.01,
			allowNegative: false,
		});
		expect(result.value).toBe(0);
	});

	it("increments 12.34 by 0.01", () => {
		const result = applyStep(12.34, 1, { ...enUs, step: 0.01 });
		expect(result.value).toBe(12.35);
	});
});
