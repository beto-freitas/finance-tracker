import {
	addIsoDays,
	getIsoWeekday,
	SATURDAY_DAY_INDEX,
	SUNDAY_DAY_INDEX,
} from "#/lib/date/iso-date";

/** Shift forward to the next weekday if isoDate falls on Saturday or Sunday (v1: no holidays). */
export function shiftToNextBusinessDay(isoDate: string): string {
	let current = isoDate;
	while (true) {
		const day = getIsoWeekday(current);
		if (day !== SUNDAY_DAY_INDEX && day !== SATURDAY_DAY_INDEX) {
			return current;
		}
		current = addIsoDays(current, 1);
	}
}

/** Count forward in business days from isoDate (after weekend shift). */
export function addBusinessDays(isoDate: string, businessDays: number): string {
	if (businessDays <= 0) {
		return shiftToNextBusinessDay(isoDate);
	}

	let current = shiftToNextBusinessDay(isoDate);
	let remaining = businessDays;

	while (remaining > 0) {
		current = addIsoDays(current, 1);
		const day = getIsoWeekday(current);
		if (day !== SUNDAY_DAY_INDEX && day !== SATURDAY_DAY_INDEX) {
			remaining -= 1;
		}
	}

	return current;
}
