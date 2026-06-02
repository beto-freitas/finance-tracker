/** Exchange rates at 2 decimal majors (BRL per USD). Stored as integer minors (×100). Not money — do not use `toMinorUnits`. */

const EXCHANGE_RATE_MINOR_SCALE = 100;

/** BRL per 1 USD major (5.00) → minor (500). */
export function assumedBaseRateMajorToMinor(major: number): number {
	return Math.round(major * EXCHANGE_RATE_MINOR_SCALE);
}

/** Minor → BRL per 1 USD major. */
export function assumedBaseRateMinorToMajor(minor: number): number {
	return minor / EXCHANGE_RATE_MINOR_SCALE;
}

/** Effective rate minor → display major (2 decimals). */
export function effectiveRateMinorToMajor(minor: number): number {
	return minor / EXCHANGE_RATE_MINOR_SCALE;
}
