import { getRouteApi } from "@tanstack/react-router";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { CreateSettlementPlatformDialogForm } from "./create-settlement-platform-dialog-form";
import { closeSettlementPlatformCreate } from "./income-search";

const IncomeRoute = getRouteApi("/app/income/");

type CreateSettlementPlatformDialogProps = {
	open: boolean;
};

export function CreateSettlementPlatformDialog({
	open,
}: CreateSettlementPlatformDialogProps) {
	const navigate = IncomeRoute.useNavigate();

	const handleOpenChange = () => {
		navigate({
			search: (prev) => closeSettlementPlatformCreate(prev),
		});
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add settlement platform</DialogTitle>
				</DialogHeader>

				<CreateSettlementPlatformDialogForm />
			</DialogContent>
		</Dialog>
	);
}
