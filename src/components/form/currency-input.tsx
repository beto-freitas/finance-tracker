import { useMemo } from "react";

import type { InputAddonSlot } from "#/components/form/input-addon.tsx";
import {
	NumberInput,
	type NumberInputProps,
} from "#/components/form/number-input.tsx";
import type { CurrencyCode } from "#/lib/currency/currencies";
import { getCurrencyDisplayMeta } from "#/lib/form/currency-display.ts";

export type CurrencyInputProps = Omit<
	NumberInputProps,
	| "leftAddon"
	| "rightAddon"
	| "minimumFractionDigits"
	| "maximumFractionDigits"
	| "allowNegative"
> & {
	currency: CurrencyCode;
	allowNegative?: boolean;
};

/**
 * Money control. Wraps {@link NumberInput} with Intl-derived symbol addon,
 * fraction scale, and `allowNegative` defaulting to `false`.
 *
 * `currency` is display context only — form value remains `number | undefined`.
 * For custom fraction digits or addons, use `NumberInput` directly.
 */
export function CurrencyInput({
	currency,
	locale,
	allowNegative = false,
	...rest
}: CurrencyInputProps) {
	const { symbol, addonSide, minimumFractionDigits, maximumFractionDigits } =
		useMemo(() => getCurrencyDisplayMeta(currency, locale), [currency, locale]);

	const symbolAddon: InputAddonSlot = {
		variant: "text",
		children: symbol,
	};

	return (
		<NumberInput
			{...rest}
			locale={locale}
			allowNegative={allowNegative}
			minimumFractionDigits={minimumFractionDigits}
			maximumFractionDigits={maximumFractionDigits}
			leftAddon={addonSide === "inline-start" ? symbolAddon : undefined}
			rightAddon={addonSide === "inline-end" ? symbolAddon : undefined}
		/>
	);
}
