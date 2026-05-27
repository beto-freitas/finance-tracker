import { describe, expect, it } from "vitest";

import { getCurrencyDisplayMeta } from "#/lib/form/currency-display.ts";

const ptBr = "pt-BR";

describe("getCurrencyDisplayMeta", () => {
	it("formats BRL with R$ prefix and 2 fraction digits", () => {
		const meta = getCurrencyDisplayMeta("BRL", ptBr);
		expect(meta.symbol).toBe("R$");
		expect(meta.addonSide).toBe("inline-start");
		expect(meta.minimumFractionDigits).toBe(2);
		expect(meta.maximumFractionDigits).toBe(2);
	});

	it("formats USD with US$ prefix and 2 fraction digits in pt-BR", () => {
		const meta = getCurrencyDisplayMeta("USD", ptBr);
		expect(meta.symbol).toBe("US$");
		expect(meta.addonSide).toBe("inline-start");
		expect(meta.minimumFractionDigits).toBe(2);
		expect(meta.maximumFractionDigits).toBe(2);
	});
});
