import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { ArrowDownLeft } from "lucide-react";
import { Button } from "#/components/ui/button";
import { cashAccountListQueryOptions } from "#/features/cash-accounts/queries/cash-account-list-query-options";
import { incomeSetupStatusQueryOptions } from "#/features/income/queries/income-setup-status-query-options";
import { incomeRouteSearchSchema } from "#/features/income/schemas/income-route-search-schema";
import { SettlementPlatformOverlays } from "./-lib/settlement-platform-overlays";

export const Route = createFileRoute("/app/income/")({
	validateSearch: zodValidator(incomeRouteSearchSchema),
	loader: ({ context: { queryClient } }) => {
		queryClient.ensureQueryData(cashAccountListQueryOptions());
		queryClient.ensureQueryData(incomeSetupStatusQueryOptions());
	},
	component: IncomePage,
});

function IncomePage() {
	const { data: cashAccounts } = useSuspenseQuery(
		cashAccountListQueryOptions(),
	);
	const { data: incomeSetupStatus } = useSuspenseQuery(
		incomeSetupStatusQueryOptions(),
	);
	const hasCashAccount = cashAccounts.length > 0;
	const hasIncomeSources = incomeSetupStatus.hasIncomeSources;

	return (
		<main className="flex flex-col gap-4 p-6">
			<h1 className="flex items-center gap-2 text-base font-semibold">
				<ArrowDownLeft className="size-4 text-muted-foreground" aria-hidden />
				Income
			</h1>

			{!hasCashAccount ? (
				<p className="text-sm text-muted-foreground">
					Set up your cash account first. Income settles into it.
				</p>
			) : (
				<p className="text-sm text-muted-foreground">
					{hasIncomeSources
						? "Upcoming receipts and actions will appear here."
						: "Add an income source to generate expected receipts."}
				</p>
			)}

			<div className="flex flex-wrap items-center gap-3">
				{!hasCashAccount ? (
					<Button type="button" asChild>
						<Link to="/app/cash-accounts">Set up cash account</Link>
					</Button>
				) : hasIncomeSources ? (
					<Button type="button" asChild>
						<Link to="/app/income" search={{ "create-one-off": "true" }}>
							Add one-off
						</Link>
					</Button>
				) : (
					<Button type="button" asChild>
						<Link to="/app/income" search={{ "create-income-source": "true" }}>
							Add income source
						</Link>
					</Button>
				)}

				<Button
					type="button"
					variant="ghost"
					className="h-auto px-0 text-muted-foreground"
					disabled={!hasCashAccount}
					asChild={hasCashAccount}
				>
					{hasCashAccount ? (
						<Link
							to="/app/income"
							search={{ manage: "income-sources" }}
							className="text-sm"
						>
							Manage income sources
						</Link>
					) : (
						<span className="text-sm">Manage income sources</span>
					)}
				</Button>

				<Button
					type="button"
					variant="ghost"
					className="h-auto px-0 text-muted-foreground"
					disabled={!hasCashAccount}
					asChild={hasCashAccount}
				>
					{hasCashAccount ? (
						<Link
							to="/app/income"
							search={{ manage: "settlement-platforms" }}
							className="text-sm"
						>
							Settlement platforms
						</Link>
					) : (
						<span className="text-sm">Settlement platforms</span>
					)}
				</Button>
			</div>

			{hasCashAccount && !hasIncomeSources ? (
				<p className="text-sm text-muted-foreground">
					<Link
						to="/app/income"
						search={{ "create-one-off": "true" }}
						className="underline underline-offset-2"
					>
						Just a one-off?
					</Link>
				</p>
			) : null}

			<SettlementPlatformOverlays />
		</main>
	);
}
