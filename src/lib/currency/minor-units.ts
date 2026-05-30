/** v1 assumes 2-decimal currencies (BRL, USD). Only place allowed to ×100 / ÷100. */

export function toMinorUnits(major: number): number {
	return Math.round(major * 100);
}

export function fromMinorUnits(minor: number): number {
	return minor / 100;
}
