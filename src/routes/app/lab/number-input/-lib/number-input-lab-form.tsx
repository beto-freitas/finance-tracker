import type { ReactNode } from "react";

import type { InputAddonSlot } from "#/components/form/input-addon.tsx";
import { Button } from "#/components/ui/button.tsx";
import { useAppForm } from "#/lib/form/create-app-form.ts";
import {
	type NumberInputLabFormValues,
	numberInputLabSchema,
} from "#/routes/app/lab/number-input/-lib/number-input-lab-schema.ts";

function useNumberInputLabDefaultValues() {
	return {
		referenceEmpty: "",
		amountEmpty: undefined,

		referencePrefilled: "12.34",
		amountPrefilled: 12.34,

		referenceZero: "0.00",
		amountZero: 0,

		referenceNegative: "-5.25",
		amountNegative: -5.25,

		referenceNoNegative: "10.00",
		amountNoNegative: 10,

		referenceEnUs: "1,234.56",
		amountEnUs: 1234.56,

		referenceDeDe: "1.234,56",
		amountDeDe: 1234.56,

		referenceInteger: "42",
		amountInteger: 42,

		referenceHighPrecision: "1.234",
		amountHighPrecision: 1.234,

		referenceAddons: "$1,234.56",
		amountAddons: 1234.56,

		referenceStepOne: "100",
		amountStepOne: 100,

		referenceDisabled: "99.99",
		amountDisabled: 99.99,
	} satisfies NumberInputLabFormValues as NumberInputLabFormValues;
}

const currencyLeftAddon = {
	variant: "text",
	children: "$",
} satisfies InputAddonSlot;

const currencyRightAddon = {
	variant: "text",
	children: "USD",
} satisfies InputAddonSlot;

function ComparisonRow({
	hint,
	referenceField,
	amountField,
}: {
	hint: string;
	referenceField: ReactNode;
	amountField: ReactNode;
}) {
	return (
		<div className="grid grid-cols-2 gap-4 border-b border-border pb-6 last:border-b-0 last:pb-0">
			<div>{referenceField}</div>
			<div>{amountField}</div>
			<p className="col-span-2 text-muted-foreground text-sm">{hint}</p>
		</div>
	);
}

export function NumberInputLabForm() {
	const defaultValues = useNumberInputLabDefaultValues();

	const form = useAppForm({
		defaultValues,
		validators: {
			onChange: numberInputLabSchema,
		},
		onSubmit: async ({ value }) => {
			console.log(value);
		},
	});

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-wrap gap-2">
				<Button type="button" variant="outline" onClick={() => form.reset()}>
					Reset to defaults
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						form.setFieldValue("amountNegative", undefined);
					}}
				>
					Clear sample amounts
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => form.setFieldValue("amountPrefilled", 12.34)}
				>
					Reset prefilled → 12.34
				</Button>
			</div>

			<form
				onSubmit={(event) => {
					event.preventDefault();
					void form.handleSubmit();
				}}
				className="flex flex-col gap-6"
			>
				<ComparisonRow
					hint="Empty: type 1234 at end → 12.34; backspace to clear. Arrow Up → 1."
					referenceField={
						<form.AppField name="referenceEmpty">
							{(field) => <field.TextInput label="TextInput (reference)" />}
						</form.AppField>
					}
					amountField={
						<form.AppField name="amountEmpty">
							{(field) => <field.NumberInput label="NumberInput" />}
						</form.AppField>
					}
				/>

				<ComparisonRow
					hint="Pre-filled 12.34: focus end, type 56 → 1234.56; 12.|34 + 5 → 125.34."
					referenceField={
						<form.AppField name="referencePrefilled">
							{(field) => <field.TextInput label="TextInput (reference)" />}
						</form.AppField>
					}
					amountField={
						<form.AppField name="amountPrefilled">
							{(field) => <field.NumberInput label="NumberInput" />}
						</form.AppField>
					}
				/>

				<ComparisonRow
					hint="Explicit zero (0.00 on blur). Not the same as empty undefined."
					referenceField={
						<form.AppField name="referenceZero">
							{(field) => <field.TextInput label="TextInput (reference)" />}
						</form.AppField>
					}
					amountField={
						<form.AppField name="amountZero">
							{(field) => <field.NumberInput label="NumberInput" />}
						</form.AppField>
					}
				/>

				<ComparisonRow
					hint="Negatives allowed. Toggle - at start; paste -1234 → -12.34."
					referenceField={
						<form.AppField name="referenceNegative">
							{(field) => <field.TextInput label="TextInput (reference)" />}
						</form.AppField>
					}
					amountField={
						<form.AppField name="amountNegative">
							{(field) => (
								<field.NumberInput label="NumberInput" allowNegative />
							)}
						</form.AppField>
					}
				/>

				<ComparisonRow
					hint="allowNegative=false. Minus blocked; empty Arrow Down → 0."
					referenceField={
						<form.AppField name="referenceNoNegative">
							{(field) => <field.TextInput label="TextInput (reference)" />}
						</form.AppField>
					}
					amountField={
						<form.AppField name="amountNoNegative">
							{(field) => (
								<field.NumberInput label="NumberInput" allowNegative={false} />
							)}
						</form.AppField>
					}
				/>

				<ComparisonRow
					hint="locale=en-US (decimal .). Paste 1234 → 12.34."
					referenceField={
						<form.AppField name="referenceEnUs">
							{(field) => <field.TextInput label="TextInput (reference)" />}
						</form.AppField>
					}
					amountField={
						<form.AppField name="amountEnUs">
							{(field) => (
								<field.NumberInput label="NumberInput" locale="en-US" />
							)}
						</form.AppField>
					}
				/>

				<ComparisonRow
					hint="locale=de-DE (decimal ,). Same value, different separator."
					referenceField={
						<form.AppField name="referenceDeDe">
							{(field) => <field.TextInput label="TextInput (reference)" />}
						</form.AppField>
					}
					amountField={
						<form.AppField name="amountDeDe">
							{(field) => (
								<field.NumberInput label="NumberInput" locale="de-DE" />
							)}
						</form.AppField>
					}
				/>

				<ComparisonRow
					hint="maximumFractionDigits=0. Paste 1234 → 1234; no decimal separator."
					referenceField={
						<form.AppField name="referenceInteger">
							{(field) => <field.TextInput label="TextInput (reference)" />}
						</form.AppField>
					}
					amountField={
						<form.AppField name="amountInteger">
							{(field) => (
								<field.NumberInput
									label="NumberInput"
									maximumFractionDigits={0}
									minimumFractionDigits={0}
								/>
							)}
						</form.AppField>
					}
				/>

				<ComparisonRow
					hint="3 fraction digits. Paste 1234 → 1.234."
					referenceField={
						<form.AppField name="referenceHighPrecision">
							{(field) => <field.TextInput label="TextInput (reference)" />}
						</form.AppField>
					}
					amountField={
						<form.AppField name="amountHighPrecision">
							{(field) => (
								<field.NumberInput
									label="NumberInput"
									maximumFractionDigits={3}
									minimumFractionDigits={3}
								/>
							)}
						</form.AppField>
					}
				/>

				<ComparisonRow
					hint="Addons on both sides — bar should match TextInput reference."
					referenceField={
						<form.AppField name="referenceAddons">
							{(field) => (
								<field.TextInput
									label="TextInput (reference)"
									leftAddon={currencyLeftAddon}
									rightAddon={currencyRightAddon}
								/>
							)}
						</form.AppField>
					}
					amountField={
						<form.AppField name="amountAddons">
							{(field) => (
								<field.NumberInput
									label="NumberInput"
									leftAddon={currencyLeftAddon}
									rightAddon={currencyRightAddon}
								/>
							)}
						</form.AppField>
					}
				/>

				<ComparisonRow
					hint="step=1. Arrow Up/Down moves by 1 when valued; empty Up still → 1."
					referenceField={
						<form.AppField name="referenceStepOne">
							{(field) => <field.TextInput label="TextInput (reference)" />}
						</form.AppField>
					}
					amountField={
						<form.AppField name="amountStepOne">
							{(field) => (
								<field.NumberInput
									label="NumberInput"
									step={1}
									maximumFractionDigits={2}
								/>
							)}
						</form.AppField>
					}
				/>

				<ComparisonRow
					hint="Disabled — no edits."
					referenceField={
						<form.AppField name="referenceDisabled">
							{(field) => (
								<field.TextInput label="TextInput (reference)" disabled />
							)}
						</form.AppField>
					}
					amountField={
						<form.AppField name="amountDisabled">
							{(field) => <field.NumberInput label="NumberInput" disabled />}
						</form.AppField>
					}
				/>

				<form.Subscribe selector={(state) => state.values}>
					{(values) => (
						<pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 text-xs">
							{JSON.stringify(values, null, 2)}
						</pre>
					)}
				</form.Subscribe>

				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button type="submit" disabled={!canSubmit}>
							{isSubmitting ? "Submitting…" : "Submit (validate)"}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}
