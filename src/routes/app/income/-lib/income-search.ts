import type { IncomeRouteSearch } from "#/features/income/schemas/income-route-search-schema";

const SETTLEMENT_PLATFORM_DIALOG_KEYS = [
	"create-settlement-platform",
	"edit-settlement-platform-id",
	"delete-settlement-platform-id",
] as const satisfies readonly (keyof IncomeRouteSearch)[];

type SettlementPlatformOverlayKey =
	(typeof SETTLEMENT_PLATFORM_DIALOG_KEYS)[number];

function withoutSettlementPlatformDialogs(
	search: IncomeRouteSearch,
): IncomeRouteSearch {
	return omitIncomeSearchKeys(search, [...SETTLEMENT_PLATFORM_DIALOG_KEYS]);
}

export function omitIncomeSearchKeys(
	search: IncomeRouteSearch,
	keys: (keyof IncomeRouteSearch)[],
): IncomeRouteSearch {
	const next = { ...search };
	for (const key of keys) {
		delete next[key];
	}
	return next;
}

export function closeSettlementPlatformCreate(
	search: IncomeRouteSearch,
): IncomeRouteSearch {
	return omitIncomeSearchKeys(search, ["create-settlement-platform"]);
}

export function closeSettlementPlatformEdit(
	search: IncomeRouteSearch,
): IncomeRouteSearch {
	return omitIncomeSearchKeys(search, ["edit-settlement-platform-id"]);
}

export function closeSettlementPlatformDelete(
	search: IncomeRouteSearch,
): IncomeRouteSearch {
	return omitIncomeSearchKeys(search, ["delete-settlement-platform-id"]);
}

export function closeSettlementPlatformManage(
	search: IncomeRouteSearch,
): IncomeRouteSearch {
	const next = omitIncomeSearchKeys(search, ["manage"]);
	return omitIncomeSearchKeys(next, [
		"create-settlement-platform",
		"edit-settlement-platform-id",
		"delete-settlement-platform-id",
	]);
}

export function openSettlementPlatformCreate(
	search: IncomeRouteSearch,
): IncomeRouteSearch {
	return {
		...withoutSettlementPlatformDialogs(search),
		"create-settlement-platform": "true",
	};
}

export function openSettlementPlatformEdit(
	search: IncomeRouteSearch,
	platformId: string,
): IncomeRouteSearch {
	return {
		...withoutSettlementPlatformDialogs(search),
		"edit-settlement-platform-id": platformId,
	};
}

export function openSettlementPlatformDelete(
	search: IncomeRouteSearch,
	platformId: string,
): IncomeRouteSearch {
	return {
		...withoutSettlementPlatformDialogs(search),
		"delete-settlement-platform-id": platformId,
	};
}

export function hasSettlementPlatformOverlay(
	search: IncomeRouteSearch,
): boolean {
	return (
		search.manage === "settlement-platforms" ||
		search["create-settlement-platform"] === "true" ||
		search["edit-settlement-platform-id"] != null ||
		search["delete-settlement-platform-id"] != null
	);
}

export type { SettlementPlatformOverlayKey };
