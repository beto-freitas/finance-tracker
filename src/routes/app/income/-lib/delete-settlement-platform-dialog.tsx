import { useMutation } from "@tanstack/react-query";
import { getRouteApi, Navigate } from "@tanstack/react-router";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import { deleteSettlementPlatformMutationOptions } from "#/features/settlement-platforms/mutations/delete-settlement-platform-mutation-options";
import type { SettlementPlatformListItem } from "#/features/settlement-platforms/queries/settlement-platform-list-query-options";
import {
	formatAssumedBaseRateMajor,
	formatEffectiveRateMajor,
	formatSpreadPercentMajor,
} from "#/lib/currency/format-rate";
import { closeSettlementPlatformDelete } from "./income-search";

const IncomeRoute = getRouteApi("/app/income/");

type DeleteSettlementPlatformDialogProps = {
	open: boolean;
	platformId: string;
	platforms: SettlementPlatformListItem[] | undefined;
};

export function DeleteSettlementPlatformDialog({
	open,
	platformId,
	platforms,
}: DeleteSettlementPlatformDialogProps) {
	const navigate = IncomeRoute.useNavigate();
	const deleteMutation = useMutation(deleteSettlementPlatformMutationOptions());
	const platform = platforms?.find((row) => row.id === platformId);

	if (!platform) {
		return (
			<Navigate
				to="/app/income"
				search={(prev) => closeSettlementPlatformDelete(prev)}
				replace
			/>
		);
	}

	const handleOpenChange = () => {
		navigate({
			search: (prev) => closeSettlementPlatformDelete(prev),
		});
	};

	const handleConfirm = async () => {
		await deleteMutation.mutateAsync({
			data: { settlementPlatformId: platformId },
		});
		navigate({
			search: (prev) => closeSettlementPlatformDelete(prev),
		});
	};

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete settlement platform?</AlertDialogTitle>
					<AlertDialogDescription asChild>
						<div className="flex flex-col gap-2 text-sm text-muted-foreground">
							<p>
								<span className="font-medium text-foreground">
									{platform.name}
								</span>{" "}
								({platform.incomeCurrency}) will be removed. Income sources and
								receipts still linked to it cannot be deleted.
							</p>
							<p className="tabular-nums">
								Spread{" "}
								{formatSpreadPercentMajor(platform.exchangeSpreadPercentMajor)}{" "}
								· Base{" "}
								{formatAssumedBaseRateMajor(platform.assumedBaseRateMajor)} ·
								Effective{" "}
								{formatEffectiveRateMajor(platform.effectiveRateMajor)}
							</p>
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deleteMutation.isPending}>
						Cancel
					</AlertDialogCancel>
					<Button
						variant="destructive"
						disabled={deleteMutation.isPending}
						onClick={() => void handleConfirm()}
					>
						{deleteMutation.isPending ? "Deleting..." : "Delete"}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
