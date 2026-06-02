import { addDays } from "date-fns";

export const SUNDAY_DAY_INDEX = 0;
export const SATURDAY_DAY_INDEX = 6;

export function toIsoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export function todayIsoDate(): string {
	return toIsoDate(new Date());
}

/** Parse YYYY-MM-DD as UTC midnight. Calendar dates are timezone-agnostic; math uses UTC. */
export function parseIsoDateUtc(isoDate: string): Date {
	const [year, month, day] = isoDate.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

/** Add calendar days to an ISO date string; returns YYYY-MM-DD in UTC. */
export function addIsoDays(isoDate: string, days: number): string {
	return toIsoDate(addDays(parseIsoDateUtc(isoDate), days));
}

/** Weekday for an ISO date (0 = Sunday, 6 = Saturday), UTC. */
export function getIsoWeekday(isoDate: string): number {
	return parseIsoDateUtc(isoDate).getUTCDay();
}
