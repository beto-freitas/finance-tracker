import { useMutation } from "@tanstack/react-query";
import { Button } from "#/components/ui/button.tsx";
import { createCashAccountMutationOptions } from "#/features/cash-accounts/mutations/create-cash-account-mutation-options";
import {
	type CreateCashAccountFormValues,
	createCashAccountFormSchema,
} from "#/features/cash-accounts/schemas/create-cash-account-form-schema";
import { todayIsoDate } from "#/lib/date/iso-date";
import { useAppForm } from "#/lib/form/create-app-form.ts";

function useCreateCashAccountFormDefaultValues() {
	return {
		name: "",
		balanceMajor: undefined as unknown as number,
		balanceAsOfDate: todayIsoDate(),
	} satisfies CreateCashAccountFormValues as CreateCashAccountFormValues;
}

export function CreateCashAccountForm() {
	const createCashAccountMutation = useMutation(
		createCashAccountMutationOptions(),
	);
	const defaultValues = useCreateCashAccountFormDefaultValues();

	const form = useAppForm({
		defaultValues,
		validators: {
			onChange: createCashAccountFormSchema,
		},
		onSubmit: async ({ value }) => {
			await createCashAccountMutation.mutateAsync({
				data: {
					formData: value,
				},
			});
		},
	});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
			className="flex flex-col gap-4"
		>
			<form.AppField name="name">
				{(field) => <field.TextInput />}
			</form.AppField>

			<form.AppField name="balanceMajor">
				{(field) => <field.CurrencyInput label="Balance" currency="BRL" />}
			</form.AppField>

			<form.AppField name="balanceAsOfDate">
				{(field) => <field.DateInput label="Balance as of date" />}
			</form.AppField>

			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
			>
				{([canSubmit, isSubmitting]) => (
					<Button type="submit" disabled={!canSubmit}>
						{isSubmitting ? "Creating..." : "Create cash account"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
