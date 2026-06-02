import { getRouteApi } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "#/components/ui/button";
import { LoadingSpinner } from "#/components/ui/loading-spinner";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "#/components/ui/sheet";
import type { SettlementPlatformListItem } from "#/features/settlement-platforms/queries/settlement-platform-list-query-options";
import {
	closeSettlementPlatformManage,
	openSettlementPlatformCreate,
} from "./income-search";
import { SettlementPlatformCard } from "./settlement-platform-card";

const IncomeRoute = getRouteApi("/app/income/");

type SettlementPlatformSheetProps = {
	open: boolean;
	loading: boolean;
	platforms: SettlementPlatformListItem[] | undefined;
};

export function SettlementPlatformSheet({
	open,
	loading,
	platforms,
}: SettlementPlatformSheetProps) {
	const navigate = IncomeRoute.useNavigate();

	const handleOpenChange = () => {
		navigate({
			search: (prev) => closeSettlementPlatformManage(prev),
		});
	};

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetContent className="flex w-full flex-col gap-4">
				<SheetHeader>
					<SheetTitle>Settlement platforms</SheetTitle>
				</SheetHeader>

				<Button
					type="button"
					variant="outline"
					className="w-fit"
					disabled={loading}
					onClick={() => {
						navigate({
							search: (prev) => openSettlementPlatformCreate(prev),
						});
					}}
				>
					<Plus className="size-4" aria-hidden />
					Add platform
				</Button>

				{loading ? (
					<div className="flex justify-center py-8">
						<LoadingSpinner />
					</div>
				) : platforms?.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No settlement platforms yet. Add one for foreign-currency income
						(e.g. Higlobe).
					</p>
				) : (
					<ul className="flex flex-col gap-3">
						{platforms?.map((platform) => (
							<SettlementPlatformCard key={platform.id} platform={platform} />
						))}
					</ul>
				)}
			</SheetContent>
		</Sheet>
	);
}
