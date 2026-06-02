import { useMutation } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { DialogFooter } from "#/components/ui/dialog";
import { updateSettlementPlatformMutationOptions } from "#/features/settlement-platforms/mutations/update-settlement-platform-mutation-options";
import type { SettlementPlatformListItem } from "#/features/settlement-platforms/queries/settlement-platform-list-query-options";
import {
	type SettlementPlatformFormValues,
	settlementPlatformFormSchema,
} from "#/features/settlement-platforms/schemas/settlement-platform-form-schema";
import { useAppForm } from "#/lib/form/create-app-form";
import { closeSettlementPlatformEdit } from "./income-search";
import { SettlementPlatformForm } from "./settlement-platform-form";

const IncomeRoute = getRouteApi("/app/income/");

type EditSettlementPlatformDialogFormProps = {
	platformId: string;
	platform: SettlementPlatformListItem | undefined;
};

function useSettlementPlatformFormDefaultValues(
	platform: SettlementPlatformListItem | undefined,
) {
	if (!platform) {
		return {} as SettlementPlatformFormValues;
	}

	return {
		name: platform.name,
		incomeCurrency: platform.incomeCurrency,
		exchangeSpreadPercentMajor: platform.exchangeSpreadPercentMajor,
		assumedBaseRateMajor: platform.assumedBaseRateMajor,
	} satisfies SettlementPlatformFormValues as SettlementPlatformFormValues;
}

export function EditSettlementPlatformDialogForm({
	platformId,
	platform,
}: EditSettlementPlatformDialogFormProps) {
	const navigate = IncomeRoute.useNavigate();
	const updateMutation = useMutation(updateSettlementPlatformMutationOptions());

	const defaultValues = useSettlementPlatformFormDefaultValues(platform);

	const form = useAppForm({
		defaultValues,
		validators: {
			onChange: settlementPlatformFormSchema,
		},
		onSubmit: async ({ value }) => {
			await updateMutation.mutateAsync({
				data: {
					settlementPlatformId: platformId,
					formData: value,
				},
			});

			navigate({
				search: (prev) => closeSettlementPlatformEdit(prev),
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
