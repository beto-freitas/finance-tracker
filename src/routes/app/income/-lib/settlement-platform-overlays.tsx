import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { settlementPlatformListQueryOptions } from "#/features/settlement-platforms/queries/settlement-platform-list-query-options";
import { CreateSettlementPlatformDialog } from "./create-settlement-platform-dialog";
import { DeleteSettlementPlatformDialog } from "./delete-settlement-platform-dialog";
import { EditSettlementPlatformDialog } from "./edit-settlement-platform-dialog";
import { SettlementPlatformSheet } from "./settlement-platform-sheet";

const IncomeRoute = getRouteApi("/app/income/");

/** Whether the platform list query should run (not for create-only overlay). */
function useSettlementPlatformListEnabled(): boolean {
	const search = IncomeRoute.useSearch();

	return (
		search.manage === "settlement-platforms" ||
		search["edit-settlement-platform-id"] != null ||
		search["delete-settlement-platform-id"] != null
	);
}

function useSettlementPlatformMeta() {
	const search = IncomeRoute.useSearch();

	const manageOpen = search.manage === "settlement-platforms";
	const createOpen = search["create-settlement-platform"] === "true";
	const editPlatformId = search["edit-settlement-platform-id"];
	const deletePlatformId = search["delete-settlement-platform-id"];

	return {
		manageOpen,
		createOpen,
		editPlatformId,
		deletePlatformId,
	};
}

export function SettlementPlatformOverlays() {
	const listEnabled = useSettlementPlatformListEnabled();
	const { manageOpen, createOpen, editPlatformId, deletePlatformId } =
		useSettlementPlatformMeta();

	const { data: platforms, isLoading: listLoading } = useQuery(
		settlementPlatformListQueryOptions(listEnabled),
	);

	const isLoading = listEnabled && listLoading;

	return (
		<>
			<SettlementPlatformSheet
				open={manageOpen}
				loading={isLoading}
				platforms={platforms}
			/>

			{/* loading is handled in the sheet */}
			{!isLoading && (
				<>
					<CreateSettlementPlatformDialog open={createOpen} />

					<EditSettlementPlatformDialog
						open={!!editPlatformId}
						platformId={editPlatformId ?? ""}
						platforms={platforms}
					/>

					<DeleteSettlementPlatformDialog
						open={!!deletePlatformId}
						platformId={deletePlatformId ?? ""}
						platforms={platforms}
					/>
				</>
			)}
		</>
	);
}
