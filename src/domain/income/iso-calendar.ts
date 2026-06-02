import { parseIsoDateUtc, toIsoDate } from "#/lib/date/iso-date";

export function lastDayOfMonth(year: number, monthIndex: number): number {
	return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/** Calendar day in month, clamped when dayOfMonth exceeds month length (e.g. 31 → 28 in Feb). */
export function calendarDateInMonth(
	year: number,
	monthIndex: number,
	dayOfMonth: number,
): string {
	const day = Math.min(dayOfMonth, lastDayOfMonth(year, monthIndex));
	return toIsoDate(new Date(Date.UTC(year, monthIndex, day)));
}

export function parseYearMonth(isoDate: string): {
	year: number;
	monthIndex: number;
} {
	const date = parseIsoDateUtc(isoDate);
	return { year: date.getUTCFullYear(), monthIndex: date.getUTCMonth() };
}

export function addMonths(
	year: number,
	monthIndex: number,
	monthsToAdd: number,
): { year: number; monthIndex: number } {
	const date = new Date(Date.UTC(year, monthIndex + monthsToAdd, 1));
	return { year: date.getUTCFullYear(), monthIndex: date.getUTCMonth() };
}
