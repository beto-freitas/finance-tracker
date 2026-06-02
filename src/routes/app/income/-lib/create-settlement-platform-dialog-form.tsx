import { useMutation } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { DialogFooter } from "#/components/ui/dialog";
import { createSettlementPlatformMutationOptions } from "#/features/settlement-platforms/mutations/create-settlement-platform-mutation-options";
import {
	type SettlementPlatformFormValues,
	settlementPlatformFormSchema,
} from "#/features/settlement-platforms/schemas/settlement-platform-form-schema";
import { useAppForm } from "#/lib/form/create-app-form";
import { closeSettlementPlatformCreate } from "./income-search";
import { SettlementPlatformForm } from "./settlement-platform-form";

const IncomeRoute = getRouteApi("/app/income/");

function useSettlementPlatformFormDefaultValues() {
	return {
		name: "",
		incomeCurrency: "USD",
		exchangeSpreadPercentMajor: undefined as unknown as number,
		assumedBaseRateMajor: undefined as unknown as number,
	} satisfies SettlementPlatformFormValues as SettlementPlatformFormValues;
}

export function CreateSettlementPlatformDialogForm() {
	const navigate = IncomeRoute.useNavigate();
	const createMutation = useMutation(createSettlementPlatformMutationOptions());

	const defaultValues = useSettlementPlatformFormDefaultValues();

	const form = useAppForm({
		defaultValues,
		validators: {
			onChange: settlementPlatformFormSchema,
		},
		onSubmit: async ({ value }) => {
			await createMutation.mutateAsync({
				data: { formData: value },
			});

			navigate({
				search: (prev) => closeSettlementPlatformCreate(prev),
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
			<SettlementPlatformForm form={form} />

			<DialogFooter>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button type="submit" disabled={!canSubmit || isSubmitting}>
							{isSubmitting ? "Saving..." : "Save"}
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
