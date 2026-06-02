import { getRouteApi, Navigate } from "@tanstack/react-router";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import type { SettlementPlatformListItem } from "#/features/settlement-platforms/queries/settlement-platform-list-query-options";
import { EditSettlementPlatformDialogForm } from "./edit-settlement-platform-dialog-form";
import { closeSettlementPlatformEdit } from "./income-search";

const IncomeRoute = getRouteApi("/app/income/");

type EditSettlementPlatformDialogProps = {
	open: boolean;
	platformId: string;
	platforms: SettlementPlatformListItem[] | undefined;
};

export function EditSettlementPlatformDialog({
	open,
	platformId,
	platforms,
}: EditSettlementPlatformDialogProps) {
	const navigate = IncomeRoute.useNavigate();
	const platform = platforms?.find((row) => row.id === platformId);

	const platformNotFound =
		open && platforms !== undefined && platformId !== "" && platform == null;

	if (platformNotFound) {
		return (
			<Navigate
				to="/app/income"
				search={(prev) => closeSettlementPlatformEdit(prev)}
				replace
			/>
		);
	}

	const handleOpenChange = () => {
		navigate({
			search: (prev) => closeSettlementPlatformEdit(prev),
		});
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit settlement platform</DialogTitle>
				</DialogHeader>

				<EditSettlementPlatformDialogForm
					platformId={platformId}
					platform={platform}
				/>
			</DialogContent>
		</Dialog>
	);
}
