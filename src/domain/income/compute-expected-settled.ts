import { computeEffectiveRateMinor } from "./effective-exchange-rate";

/** BRL income: nominal and settled match 1:1 in minor units. */
export function computeExpectedSettledMinorSameCurrency(
	nominalMinor: number,
): number {
	return nominalMinor;
}

/** FX: nominal in income currency minor; base rate minor (2dp); spread in basis points. */
export function computeExpectedSettledMinorFx(
	nominalMinor: number,
	assumedBaseRateMinor: number,
	exchangeSpreadBasisPoints: number,
): number {
	const effectiveRateMinor = computeEffectiveRateMinor(
		assumedBaseRateMinor,
		exchangeSpreadBasisPoints,
	);
	return Math.round((nominalMinor * effectiveRateMinor) / 100);
}
