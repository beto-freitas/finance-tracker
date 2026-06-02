/**
 * Effective exchange rate scaled × 10_000 after platform spread.
 * @param assumedBaseRateScaled BRL per 1 USD major × 10_000 (50000 = 5.0000)
 * @param exchangeSpreadBasisPoints Platform spread in basis points (30 = 0.30%)
 */
export function computeEffectiveRateScaled(
	assumedBaseRateScaled: number,
	exchangeSpreadBasisPoints: number,
): number {
	return Math.round(
		(assumedBaseRateScaled * (10_000 - exchangeSpreadBasisPoints)) / 10_000,
	);
}
