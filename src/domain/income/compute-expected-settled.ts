import { computeEffectiveRateScaled } from "./effective-exchange-rate";

/** BRL income: nominal and settled match 1:1 in minor units. */
export function computeExpectedSettledMinorSameCurrency(
	nominalMinor: number,
): number {
	return nominalMinor;
}

/** FX: nominal in income currency minor; rate scaled × 10_000; spread in basis points. */
export function computeExpectedSettledMinorFx(
	nominalMinor: number,
	assumedBaseRateScaled: number,
	exchangeSpreadBasisPoints: number,
): number {
	const effectiveRateScaled = computeEffectiveRateScaled(
		assumedBaseRateScaled,
		exchangeSpreadBasisPoints,
	);
	return Math.round((nominalMinor * effectiveRateScaled) / 10_000);
}
