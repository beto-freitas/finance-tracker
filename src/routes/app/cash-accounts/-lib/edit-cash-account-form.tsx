import { useMutation } from "@tanstack/react-query";
import { Button } from "#/components/ui/button.tsx";
import { updateCashAccountMutationOptions } from "#/features/cash-accounts/mutations/update-cash-account-mutation-options";
import type { CashAccountListItem } from "#/features/cash-accounts/queries/cash-account-list-query-options";
import {
	type UpdateCashAccountFormValues,
	updateCashAccountFormSchema,
} from "#/features/cash-accounts/schemas/update-cash-account-form-schema";
import { useAppForm } from "#/lib/form/create-app-form.ts";

type EditCashAccountFormProps = {
	editData: CashAccountListItem;
};

function useEditCashAccountFormDefaultValues(editData: CashAccountListItem) {
	return {
		name: editData.name,
		balanceMajor: editData.balanceMajor,
		balanceAsOfDate: editData.balanceAsOfDate,
	} satisfies UpdateCashAccountFormValues as UpdateCashAccountFormValues;
}

export function EditCashAccountForm({ editData }: EditCashAccountFormProps) {
	const updateCashAccountMutation = useMutation(
		updateCashAccountMutationOptions(),
	);
	const defaultValues = useEditCashAccountFormDefaultValues(editData);

	const form = useAppForm({
		defaultValues,
		validators: {
			onChange: updateCashAccountFormSchema,
		},
		onSubmit: async ({ value }) => {
			await updateCashAccountMutation.mutateAsync({
				data: {
					cashAccountId: editData.id,
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
						{isSubmitting ? "Saving..." : "Update cash account"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
