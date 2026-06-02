/** Split monthly total equally across occurrence rules; remainder minors go to earliest rules. */
export function splitPeriodNominalMinor(
	monthlyTotalMinor: number,
	ruleCount: number,
): number[] {
	if (ruleCount <= 0) {
		throw new Error("ruleCount must be positive");
	}

	const base = Math.floor(monthlyTotalMinor / ruleCount);
	const remainder = monthlyTotalMinor % ruleCount;

	return Array.from({ length: ruleCount }, (_, index) =>
		index < remainder ? base + 1 : base,
	);
}
