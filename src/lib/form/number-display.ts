const DEFAULT_LOCALE = "pt-BR";

/** Max digits in the integer part (fraction scale not counted toward this cap). */
const MAX_INTEGER_DIGITS = 15;

type NumberDisplayMeta = {
	decimalSeparator: string;
};

export type NumberFormatOptions = {
	locale?: string;
	minimumFractionDigits?: number;
	maximumFractionDigits?: number;
};

export type NumberEditOptions = NumberFormatOptions & {
	allowNegative?: boolean;
};

export type NumberEditState = {
	digitString: string;
	negative: boolean;
	scale: number;
};

export type NumberEditResult = {
	state: NumberEditState;
	display: string;
	caretGap: number;
	caretDisplay: number;
	selection: { start: number; end: number };
	value: number | undefined;
};

function resolveNumberLocale(locale?: string): string {
	if (locale) return locale;
	if (typeof navigator !== "undefined" && navigator.language) {
		return navigator.language;
	}
	return DEFAULT_LOCALE;
}

function getNumberDisplayMeta(locale?: string): NumberDisplayMeta {
	const resolved = resolveNumberLocale(locale);
	const parts = new Intl.NumberFormat(resolved).formatToParts(1.1);
	const literal = parts.find((part) => part.type === "decimal")?.value;
	if (literal && /^[.,]$/.test(literal)) {
		return { decimalSeparator: literal };
	}
	return { decimalSeparator: "." };
}

export function resolveStep(
	maximumFractionDigits: number,
	step?: number,
): number {
	return step ?? 10 ** -maximumFractionDigits;
}

export function resolveScale(options: NumberFormatOptions): number {
	return options.maximumFractionDigits ?? 2;
}

export function resolveMinimumFractionDigits(
	options: NumberFormatOptions,
): number {
	return options.minimumFractionDigits ?? options.maximumFractionDigits ?? 2;
}

/** Form value → edit state. */
export function valueToEditState(
	value: number | undefined,
	options: NumberFormatOptions,
): NumberEditState {
	const scale = resolveScale(options);
	if (value == null || Number.isNaN(value)) {
		return { digitString: "", negative: false, scale };
	}

	if (value === 0) {
		return { digitString: "0", negative: false, scale };
	}

	const negative = value < 0;
	const minor = numberToMinorUnits(Math.abs(value), scale);
	const digitString = minor.toString();

	return { digitString, negative, scale };
}

/** Edit state → form value. */
export function editStateToValue(state: NumberEditState): number | undefined {
	if (!state.digitString) return undefined;
	const minor = BigInt(state.digitString);
	const magnitude = Number(minor) / 10 ** state.scale;
	if (!Number.isFinite(magnitude)) return undefined;
	const signed = state.negative ? -magnitude : magnitude;
	return signed === 0 ? 0 : signed;
}

/** Format a stored number for blurred display. */
export function formatNumberToDisplay(
	value: number | undefined,
	options: NumberFormatOptions,
): string {
	if (value == null || Number.isNaN(value)) return "";
	const state = valueToEditState(value, options);
	const minFrac = resolveMinimumFractionDigits(options);
	return formatEditStateToDisplay(state, options, minFrac);
}

function formatEditStateToDisplay(
	state: NumberEditState,
	options: NumberFormatOptions,
	minimumFractionDigits?: number,
): string {
	if (!state.digitString) return "";

	const { decimalSeparator } = getNumberDisplayMeta(options.locale);
	const minFrac = minimumFractionDigits ?? state.scale;

	if (state.scale === 0) {
		const body = state.digitString;
		return state.negative ? `-${body}` : body;
	}

	const padded = state.digitString.padStart(state.scale + 1, "0");
	const fraction = padded.slice(-state.scale).padEnd(minFrac, "0");
	const integer = padded.slice(0, -state.scale) || "0";
	const unsigned = `${integer}${decimalSeparator}${fraction}`;
	return state.negative ? `-${unsigned}` : unsigned;
}

function buildEditResult(
	state: NumberEditState,
	options: NumberFormatOptions,
	caretGap: number,
	minimumFractionDigits?: number,
): NumberEditResult {
	const display = formatEditStateToDisplay(
		state,
		options,
		minimumFractionDigits,
	);
	const caretDisplay = gapToDisplayCaret(
		state,
		clampGap(caretGap, getPaddedDigits(state).length),
		options,
	);
	return {
		state,
		display,
		caretGap: clampGap(caretGap, getPaddedDigits(state).length),
		caretDisplay,
		selection: { start: caretDisplay, end: caretDisplay },
		value: editStateToValue(state),
	};
}

export function displayCaretToGap(
	display: string,
	displayCaret: number,
	options: NumberFormatOptions,
	state: NumberEditState,
): number {
	if (!state.digitString) return 0;

	const { decimalSeparator } = getNumberDisplayMeta(options.locale);
	const signOffset = state.negative ? 1 : 0;
	const caret = Math.max(0, Math.min(displayCaret, display.length));
	const padded = getPaddedDigits(state);

	if (state.scale === 0) {
		const digitIndex = Math.max(0, caret - signOffset);
		return clampGap(digitIndex, padded.length);
	}

	const sepIndex = display.indexOf(decimalSeparator);
	if (sepIndex === -1) {
		return clampGap(caret - signOffset, padded.length);
	}

	if (caret <= signOffset) return 0;
	if (caret <= sepIndex) {
		return clampGap(caret - signOffset, padded.length);
	}

	const fractionIndex = caret - sepIndex - 1;
	const integerLen = sepIndex - signOffset;
	return clampGap(integerLen + fractionIndex, padded.length);
}

function gapToDisplayCaret(
	state: NumberEditState,
	gap: number,
	_options: NumberFormatOptions,
): number {
	if (!state.digitString) return 0;

	const signOffset = state.negative ? 1 : 0;
	const padded = getPaddedDigits(state);
	const clampedGap = clampGap(gap, padded.length);

	if (state.scale === 0) {
		return signOffset + clampedGap;
	}

	const integerLen = padded.length - state.scale;
	const sepIndex = signOffset + integerLen;

	if (clampedGap <= integerLen) {
		return signOffset + clampedGap;
	}

	return sepIndex + 1 + (clampedGap - integerLen);
}

function clampGap(gap: number, digitLength: number): number {
	return Math.max(0, Math.min(gap, digitLength));
}

function normalizeDigitString(
	digits: string,
	{ preserveZero = false } = {},
): string {
	const trimmed = digits.replace(/^0+/, "");
	if (trimmed === "" && preserveZero && digits.length > 0) return "0";
	return trimmed === "" ? "" : trimmed;
}

function getPaddedDigits(state: NumberEditState): string {
	if (!state.digitString) return "";
	if (state.scale === 0) return state.digitString;
	return state.digitString.padStart(state.scale + 1, "0");
}

function canAppendDigit(state: NumberEditState): boolean {
	if (state.scale === 0) {
		const integerLen = getPaddedDigits(state).length;
		return integerLen < MAX_INTEGER_DIGITS;
	}

	const padded = getPaddedDigits(state);
	const integerLen = Math.max(0, padded.length - state.scale);
	return (
		integerLen < MAX_INTEGER_DIGITS || state.digitString.length <= state.scale
	);
}

export function applyDigit(
	state: NumberEditState,
	gap: number,
	digit: string,
	options: NumberEditOptions,
	selection?: { startGap: number; endGap: number },
): NumberEditResult {
	let next = { ...state };

	if (selection && selection.startGap !== selection.endGap) {
		next = deleteGapRange(next, selection.startGap, selection.endGap);
		gap = selection.startGap;
	}

	const padded = getPaddedDigits(next);
	if (!canAppendDigit(next) && gap >= padded.length) {
		return buildEditResult(next, options, gap);
	}

	const clampedGap = clampGap(gap, padded.length);
	const digitString =
		padded.slice(0, clampedGap) + digit + padded.slice(clampedGap);
	next = {
		...next,
		digitString: normalizeDigitString(digitString, { preserveZero: true }),
	};

	const insertedAtEnd = clampedGap === padded.length;
	const newGap = insertedAtEnd ? getPaddedDigits(next).length : clampedGap + 1;
	return buildEditResult(next, options, newGap);
}

export function applyBackspace(
	state: NumberEditState,
	gap: number,
	options: NumberEditOptions,
	selection?: { startGap: number; endGap: number },
): NumberEditResult {
	if (selection && selection.startGap !== selection.endGap) {
		const next = deleteGapRange(state, selection.startGap, selection.endGap);
		return buildEditResult(next, options, selection.startGap);
	}

	if (gap <= 0) {
		return buildEditResult(state, options, 0);
	}

	const padded = getPaddedDigits(state);
	const clampedGap = clampGap(gap, padded.length);
	const removedAtEnd = clampedGap === padded.length;
	const digitString =
		padded.slice(0, clampedGap - 1) + padded.slice(clampedGap);
	const normalized = normalizeDigitString(digitString);
	const next = {
		...state,
		digitString: normalized,
		negative: normalized ? state.negative : false,
	};
	const nextGap = removedAtEnd
		? getPaddedDigits(next).length
		: Math.max(0, clampedGap - 1);
	return buildEditResult(next, options, nextGap);
}

export function applyDelete(
	state: NumberEditState,
	gap: number,
	options: NumberEditOptions,
	selection?: { startGap: number; endGap: number },
): NumberEditResult {
	if (selection && selection.startGap !== selection.endGap) {
		const next = deleteGapRange(state, selection.startGap, selection.endGap);
		return buildEditResult(next, options, selection.startGap);
	}

	const padded = getPaddedDigits(state);
	const clampedGap = clampGap(gap, padded.length);

	if (clampedGap >= padded.length) {
		return buildEditResult(state, options, gap);
	}

	const digitString =
		padded.slice(0, clampedGap) + padded.slice(clampedGap + 1);
	const normalized = normalizeDigitString(digitString);
	const next = {
		...state,
		digitString: normalized,
		negative: normalized ? state.negative : false,
	};
	return buildEditResult(next, options, clampedGap);
}

export function applyMinusToggle(
	state: NumberEditState,
	options: NumberEditOptions,
): NumberEditResult {
	if (options.allowNegative === false) {
		return buildEditResult(
			{ ...state, negative: false },
			options,
			getPaddedDigits(state).length,
		);
	}

	if (!state.digitString) {
		return buildEditResult(state, options, 0);
	}

	return buildEditResult(
		{ ...state, negative: !state.negative },
		options,
		getPaddedDigits(state).length,
	);
}

export function applyPaste(
	state: NumberEditState,
	rawText: string,
	options: NumberEditOptions,
): NumberEditResult {
	const trimmed = rawText.trim();
	if (!trimmed) {
		return buildEditResult(state, options, state.digitString.length);
	}

	let negative = false;
	let body = trimmed;
	if (body.startsWith("-")) {
		negative = true;
		body = body.slice(1);
	}

	const digits = body.replace(/\D/g, "");
	if (!digits) {
		return buildEditResult(state, options, state.digitString.length);
	}

	if (options.allowNegative === false) {
		negative = false;
	}

	const digitString = normalizeDigitString(digits, { preserveZero: true });
	const next: NumberEditState = {
		digitString,
		negative,
		scale: state.scale,
	};

	return buildEditResult(next, options, getPaddedDigits(next).length);
}

export function applyStep(
	value: number | undefined,
	direction: 1 | -1,
	options: NumberEditOptions & { step: number },
): NumberEditResult {
	const scale = resolveScale(options);
	const allowNegative = options.allowNegative !== false;
	const state = valueToEditState(value, options);

	if (value == null && state.digitString === "") {
		const emptyStep = direction === 1 ? 1 : allowNegative ? -1 : 0;
		const nextState = valueToEditState(emptyStep, options);
		return buildEditResult(
			nextState,
			options,
			getPaddedDigits(nextState).length,
		);
	}

	const stepMinor = numberToMinorUnits(options.step, scale);
	let currentMinor =
		state.digitString === "" ? 0n : editStateToMinorUnits(state);
	if (state.digitString === "" && value != null) {
		currentMinor = numberToMinorUnits(value, scale);
	}
	currentMinor += stepMinor * BigInt(direction);

	if (!allowNegative && currentMinor < 0n) {
		currentMinor = 0n;
	}

	const nextState = minorUnitsToEditState(currentMinor, scale);
	return buildEditResult(nextState, options, getPaddedDigits(nextState).length);
}

function deleteGapRange(
	state: NumberEditState,
	startGap: number,
	endGap: number,
): NumberEditState {
	const padded = getPaddedDigits(state);
	const start = clampGap(Math.min(startGap, endGap), padded.length);
	const end = clampGap(Math.max(startGap, endGap), padded.length);
	const digitString = normalizeDigitString(
		padded.slice(0, start) + padded.slice(end),
	);
	return {
		...state,
		digitString,
		negative: digitString ? state.negative : false,
	};
}

function numberToMinorUnits(value: number, scale: number): bigint {
	const factor = 10 ** scale;
	const rounded = Math.round(value * factor + Number.EPSILON);
	return BigInt(rounded);
}

function editStateToMinorUnits(state: NumberEditState): bigint {
	if (!state.digitString) return 0n;
	const minor = BigInt(state.digitString);
	return state.negative ? -minor : minor;
}

function minorUnitsToEditState(minor: bigint, scale: number): NumberEditState {
	if (minor === 0n) {
		return { digitString: "0", negative: false, scale };
	}

	const negative = minor < 0n;
	const abs = negative ? -minor : minor;
	return {
		digitString: abs.toString(),
		negative,
		scale,
	};
}
