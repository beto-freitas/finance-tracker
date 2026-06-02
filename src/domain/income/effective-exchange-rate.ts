/**
 * Effective exchange rate minor (2dp BRL per USD) after platform spread.
 * @param assumedBaseRateMinor BRL per 1 USD at 2 decimals (500 = 5.00)
 * @param exchangeSpreadBasisPoints Platform spread in basis points (30 = 0.30%)
 */
export function computeEffectiveRateMinor(
	assumedBaseRateMinor: number,
	exchangeSpreadBasisPoints: number,
): number {
	return Math.round(
		(assumedBaseRateMinor * (10_000 - exchangeSpreadBasisPoints)) / 10_000,
	);
}
