import { format, isValid } from "date-fns";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type DatePartOrder = "dmy" | "mdy" | "ymd";

export type DateDisplayMeta = {
	order: DatePartOrder;
	separator: string;
	placeholder: string;
	parsePattern: string;
};

export type CalendarDateParts = {
	day: number;
	month: number;
	year: number;
};

const DEFAULT_LOCALE = "pt-BR";

/** Locale for display/parse; defaults to browser, then {@link DEFAULT_LOCALE}. */
export function resolveDateLocale(locale?: string): string {
	if (locale) return locale;
	if (typeof navigator !== "undefined" && navigator.language) {
		return navigator.language;
	}
	return DEFAULT_LOCALE;
}

export function isIsoDateString(value: string): boolean {
	return ISO_DATE_RE.test(value);
}

/** Display order, separator, placeholder, and `date-fns` format pattern for a locale. */
export function getDateDisplayMeta(locale?: string): DateDisplayMeta {
	const resolved = resolveDateLocale(locale);
	const order = getDatePartOrder(resolved);
	const separator = getDateSeparator(resolved);
	const placeholder = buildPlaceholder(order, separator);
	const parsePattern = buildParsePattern(order, separator);

	return { order, separator, placeholder, parsePattern };
}

function getDatePartOrder(locale: string): DatePartOrder {
	const parts = new Intl.DateTimeFormat(locale).formatToParts(
		new Date(2006, 10, 15),
	);
	const index = (type: Intl.DateTimeFormatPartTypes) =>
		parts.findIndex((part) => part.type === type);

	const dayIndex = index("day");
	const monthIndex = index("month");
	const yearIndex = index("year");

	if (yearIndex < dayIndex && yearIndex < monthIndex) {
		return "ymd";
	}
	if (monthIndex < dayIndex) {
		return "mdy";
	}
	return "dmy";
}

/** Single-char separators only; multi-char literals (e.g. ko-KR) fall back to `/`. */
function getDateSeparator(locale: string): string {
	const parts = new Intl.DateTimeFormat(locale, {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).formatToParts(new Date(2006, 10, 15));

	const literal = parts.find((part) => part.type === "literal")?.value;
	if (literal && /^[./\-\s]$/.test(literal)) {
		return literal;
	}

	return "/";
}

function buildPlaceholder(order: DatePartOrder, separator: string): string {
	const day = "DD";
	const month = "MM";
	const year = "YYYY";

	switch (order) {
		case "mdy":
			return [month, day, year].join(separator);
		case "ymd":
			return [year, month, day].join(separator);
		default:
			return [day, month, year].join(separator);
	}
}

function buildParsePattern(order: DatePartOrder, separator: string): string {
	switch (order) {
		case "mdy":
			return `MM${separator}dd${separator}yyyy`;
		case "ymd":
			return `yyyy${separator}MM${separator}dd`;
		default:
			return `dd${separator}MM${separator}yyyy`;
	}
}

/** Digits from a display string (max 8). */
export function getDisplayDigits(display: string): string {
	return display.replace(/\D/g, "").slice(0, 8);
}

/** From exactly 8 digits, split into calendar parts using locale field order. */
export function extractDateParts(
	digits: string,
	order: DatePartOrder,
): CalendarDateParts {
	if (digits.length !== 8) {
		throw new Error("extractDateParts requires exactly 8 digits");
	}

	switch (order) {
		case "ymd":
			return {
				year: Number(digits.slice(0, 4)),
				month: Number(digits.slice(4, 6)),
				day: Number(digits.slice(6, 8)),
			};
		case "mdy":
			return {
				month: Number(digits.slice(0, 2)),
				day: Number(digits.slice(2, 4)),
				year: Number(digits.slice(4, 8)),
			};
		default:
			return {
				day: Number(digits.slice(0, 2)),
				month: Number(digits.slice(2, 4)),
				year: Number(digits.slice(4, 8)),
			};
	}
}

/** Validate calendar parts and return ISO, or `null` when not a real date. */
export function calendarPartsToIso(parts: CalendarDateParts): string | null {
	const { day, month, year } = parts;

	if (month < 1 || month > 12) return null;
	if (day < 1 || day > 31) return null;

	const date = new Date(year, month - 1, day);
	if (
		date.getFullYear() !== year ||
		date.getMonth() !== month - 1 ||
		date.getDate() !== day
	) {
		return null;
	}

	return localDateToIso(date);
}

/** Parse 8 digits using locale order → `YYYY-MM-DD`, or `null`. */
export function digitsToIso(digits: string, locale?: string): string | null {
	if (digits.length !== 8) return null;

	const { order } = getDateDisplayMeta(locale);
	const parts = extractDateParts(digits, order);
	return calendarPartsToIso(parts);
}

/** Parse display string → `YYYY-MM-DD` via digits + locale order, or `null`. */
export function displayToIso(display: string, locale?: string): string | null {
	const trimmed = display.trim();
	if (!trimmed) return null;

	const digits = getDisplayDigits(trimmed);
	if (digits.length !== 8) return null;

	return digitsToIso(digits, locale);
}

/** `YYYY-MM-DD` → locale display string, or `""` when empty/invalid. */
export function formatIsoToDisplay(
	iso: string | undefined,
	locale?: string,
): string {
	if (!iso) return "";
	if (!isIsoDateString(iso)) return "";

	const date = isoToLocalDate(iso);
	if (!isValid(date)) return "";

	const { parsePattern } = getDateDisplayMeta(locale);
	return format(date, parsePattern);
}

/** Insert locale separators while the user types (digits only, max 8). */
export function formatDisplayWhileTyping(raw: string, locale?: string): string {
	const { order, separator } = getDateDisplayMeta(locale);
	const digits = getDisplayDigits(raw);
	if (!digits) return "";

	const segments = segmentDigits(digits, order);
	return segments.join(separator);
}

function segmentDigits(digits: string, order: DatePartOrder): string[] {
	switch (order) {
		case "ymd": {
			const year = digits.slice(0, 4);
			const month = digits.slice(4, 6);
			const day = digits.slice(6, 8);
			return [year, month, day].filter((part) => part.length > 0);
		}
		case "mdy": {
			const month = digits.slice(0, 2);
			const day = digits.slice(2, 4);
			const year = digits.slice(4, 8);
			return [month, day, year].filter((part) => part.length > 0);
		}
		default: {
			const day = digits.slice(0, 2);
			const month = digits.slice(2, 4);
			const year = digits.slice(4, 8);
			return [day, month, year].filter((part) => part.length > 0);
		}
	}
}

export function isoToLocalDate(iso: string): Date {
	const [year, month, day] = iso.split("-").map(Number);
	return new Date(year, month - 1, day);
}

export function localDateToIso(date: Date): string {
	const year = String(date.getFullYear()).padStart(4, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}
