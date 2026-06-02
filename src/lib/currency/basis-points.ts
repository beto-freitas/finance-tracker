/** Spread percent majors (0.30 = 0.30%) ↔ integer basis points. Uses ×100, not money. */

/** User-facing spread percent (0.30 = 0.30%) → basis points (30). */
export function spreadPercentMajorToBasisPoints(percentMajor: number): number {
	return Math.round(percentMajor * 100);
}

/** Basis points (30) → user-facing spread percent (0.30). */
export function basisPointsToSpreadPercentMajor(basisPoints: number): number {
	return basisPoints / 100;
}
