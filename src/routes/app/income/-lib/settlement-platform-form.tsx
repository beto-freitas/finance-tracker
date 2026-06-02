import { useStore } from "@tanstack/react-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { computeEffectiveRateMinor } from "#/domain/income/effective-exchange-rate";
import type { SettlementPlatformFormValues } from "#/features/settlement-platforms/schemas/settlement-platform-form-schema";
import { spreadPercentMajorToBasisPoints } from "#/lib/currency/basis-points";
import { FX_INCOME_CURRENCIES } from "#/lib/currency/currencies";
import {
	assumedBaseRateMajorToMinor,
	effectiveRateMinorToMajor,
} from "#/lib/currency/exchange-rate-minor";
import { formatEffectiveRateMajor } from "#/lib/currency/format-rate";
import { withForm } from "#/lib/form/create-app-form";
import { toSelectOptions } from "#/lib/form/to-select-options";

function computePreviewEffectiveRateMajor(
	spreadPercentMajor: number | undefined,
	assumedBaseRateMajor: number | undefined,
): string | null {
	if (spreadPercentMajor == null || assumedBaseRateMajor == null) {
		return null;
	}

	const effectiveMinor = computeEffectiveRateMinor(
		assumedBaseRateMajorToMinor(assumedBaseRateMajor),
		spreadPercentMajorToBasisPoints(spreadPercentMajor),
	);

	return formatEffectiveRateMajor(effectiveRateMinorToMajor(effectiveMinor));
}

export const SettlementPlatformForm = withForm({
	defaultValues: {} as SettlementPlatformFormValues,
	render: function SettlementPlatformFormRender({ form }) {
		const spreadPercentMajor = useStore(
			form.store,
			(state) => state.values.exchangeSpreadPercentMajor,
		);
		const assumedBaseRateMajor = useStore(
			form.store,
			(state) => state.values.assumedBaseRateMajor,
		);
		const effectivePreview = computePreviewEffectiveRateMajor(
			spreadPercentMajor,
			assumedBaseRateMajor,
		);

		return (
			<div className="flex flex-col gap-4">
				<form.AppField name="name">
					{(field) => <field.TextInput label="Name" />}
				</form.AppField>

				<form.AppField name="incomeCurrency">
					{(field) => (
						<field.SelectInput
							label="Income currency"
							options={toSelectOptions(FX_INCOME_CURRENCIES)}
							disabled
							description="USD only in v1"
						/>
					)}
				</form.AppField>

				<form.AppField name="exchangeSpreadPercentMajor">
					{(field) => (
						<field.NumberInput
							label="Exchange spread (%)"
							rightAddon={{ variant: "text", children: "%" }}
							minimumFractionDigits={2}
							maximumFractionDigits={2}
						/>
					)}
				</form.AppField>

				<form.AppField name="assumedBaseRateMajor">
					{(field) => (
						<field.NumberInput
							label="Assumed base rate (BRL per 1 USD)"
							rightAddon={{ variant: "text", children: "BRL" }}
							minimumFractionDigits={2}
							maximumFractionDigits={2}
						/>
					)}
				</form.AppField>

				<Card className="gap-2 py-4">
					<CardHeader className="px-4 pb-0">
						<CardTitle className="text-sm font-medium">
							Effective rate after spread
						</CardTitle>
						<CardDescription>
							Base × (1 − spread), for projections
						</CardDescription>
					</CardHeader>
					<CardContent className="px-4 pt-0">
						<p className="text-sm font-medium tabular-nums">
							{effectivePreview
								? `Effective rate: ${effectivePreview}`
								: "— (no values set)"}
						</p>
					</CardContent>
				</Card>
			</div>
		);
	},
});
