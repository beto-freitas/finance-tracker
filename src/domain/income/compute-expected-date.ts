import { addBusinessDays, shiftToNextBusinessDay } from "./business-days";
import { calendarDateInMonth } from "./iso-calendar";

export type ExpectedDates = {
	invoiceDate: string;
	expectedDate: string;
};

export function computeExpectedDates(
	year: number,
	monthIndex: number,
	dayOfMonth: number,
	paymentLagBusinessDays: number,
): ExpectedDates {
	const rawInvoiceDate = calendarDateInMonth(year, monthIndex, dayOfMonth);
	const invoiceDate = shiftToNextBusinessDay(rawInvoiceDate);
	const expectedDate = addBusinessDays(invoiceDate, paymentLagBusinessDays);

	return { invoiceDate, expectedDate };
}
