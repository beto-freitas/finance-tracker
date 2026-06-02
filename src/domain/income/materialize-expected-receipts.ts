import type { CurrencyCode } from "#/lib/currency/currencies";
import { computeExpectedDates } from "./compute-expected-date";
import {
	computeExpectedSettledMinorFx,
	computeExpectedSettledMinorSameCurrency,
} from "./compute-expected-settled";
import { addMonths, parseYearMonth } from "./iso-calendar";
import { splitPeriodNominalMinor } from "./split-period-nominal";

export type MaterializeIncomeSourceInput = {
	incomeSourceId: string;
	incomeCurrency: CurrencyCode;
	cashCurrency: CurrencyCode;
	monthlyTotalMinor: number;
	paymentLagBusinessDays: number;
	endDate: string | null;
	settlementPlatformId: string | null;
	assumedBaseRateScaled: number | null;
	exchangeSpreadBasisPoints: number | null;
	occurrenceDayOfMonth: number[];
};

export type ExpectedReceiptDraft = {
	incomeSourceId: string;
	settlementPlatformId: string | null;
	status: "expected";
	expectedDate: string;
	invoiceDate: string;
	nominalMinor: number;
	expectedSettledMinor: number;
};

const DEFAULT_MATERIALIZE_MONTH_COUNT = 6;

function computeSettledMinor(
	nominalMinor: number,
	incomeCurrency: CurrencyCode,
	cashCurrency: CurrencyCode,
	platform: Pick<
		MaterializeIncomeSourceInput,
		"assumedBaseRateScaled" | "exchangeSpreadBasisPoints"
	>,
): number {
	if (incomeCurrency === cashCurrency) {
		return computeExpectedSettledMinorSameCurrency(nominalMinor);
	}

	if (
		platform.assumedBaseRateScaled == null ||
		platform.exchangeSpreadBasisPoints == null
	) {
		throw new Error(
			"FX income source requires settlement platform rate config",
		);
	}

	return computeExpectedSettledMinorFx(
		nominalMinor,
		platform.assumedBaseRateScaled,
		platform.exchangeSpreadBasisPoints,
	);
}

export function materializeExpectedReceipts(
	input: MaterializeIncomeSourceInput,
	fromIsoDate: string,
	monthCount: number = DEFAULT_MATERIALIZE_MONTH_COUNT,
): ExpectedReceiptDraft[] {
	const sortedDays = [...input.occurrenceDayOfMonth].sort((a, b) => a - b);
	if (sortedDays.length === 0) {
		return [];
	}

	const nominalPerRule = splitPeriodNominalMinor(
		input.monthlyTotalMinor,
		sortedDays.length,
	);
	const { year: startYear, monthIndex: startMonthIndex } =
		parseYearMonth(fromIsoDate);
	const drafts: ExpectedReceiptDraft[] = [];

	for (let monthOffset = 0; monthOffset < monthCount; monthOffset += 1) {
		const { year, monthIndex } = addMonths(
			startYear,
			startMonthIndex,
			monthOffset,
		);

		for (const [ruleIndex, dayOfMonth] of sortedDays.entries()) {
			const { invoiceDate, expectedDate } = computeExpectedDates(
				year,
				monthIndex,
				dayOfMonth,
				input.paymentLagBusinessDays,
			);

			if (input.endDate != null && expectedDate > input.endDate) {
				continue;
			}

			const nominalMinor = nominalPerRule[ruleIndex];
			drafts.push({
				incomeSourceId: input.incomeSourceId,
				settlementPlatformId: input.settlementPlatformId,
				status: "expected",
				expectedDate,
				invoiceDate,
				nominalMinor,
				expectedSettledMinor: computeSettledMinor(
					nominalMinor,
					input.incomeCurrency,
					input.cashCurrency,
					input,
				),
			});
		}
	}

	return drafts;
}
