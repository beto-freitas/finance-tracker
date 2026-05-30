import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button.tsx";
import { cashAccountListQueryOptions } from "#/features/cash-accounts/queries/cash-account-list-query-options";
import { formatCurrency } from "#/lib/currency/format-currency";
import { CreateCashAccountForm } from "./-lib/create-cash-account-form";
import { EditCashAccountForm } from "./-lib/edit-cash-account-form";

export const Route = createFileRoute("/app/cash-accounts/")({
	loader: ({ context: { queryClient } }) => {
		queryClient.ensureQueryData(cashAccountListQueryOptions());
	},
	component: CashAccountsPage,
});

function CashAccountsPage() {
	const [showCreateForm, setShowCreateForm] = useState(false);
	const { data: cashAccounts } = useSuspenseQuery(
		cashAccountListQueryOptions(),
	);
	const hasCashAccount = cashAccounts.length > 0;

	return (
		<main className="flex flex-col gap-4 p-6">
			<h1>Cash accounts</h1>

			<Button
				type="button"
				disabled={hasCashAccount || showCreateForm}
				onClick={() => setShowCreateForm((showCreateForm) => !showCreateForm)}
			>
				+
			</Button>

			<ul className="flex flex-col gap-4">
				{cashAccounts.map((cashAccount) => (
					<li key={cashAccount.id} className="flex flex-col gap-2">
						<p>Name: {cashAccount.name}</p>
						<p>Balance: {formatCurrency(cashAccount.balanceMajor)}</p>
						<p>Balance as of date: {cashAccount.balanceAsOfDate}</p>
					</li>
				))}
			</ul>

			{!hasCashAccount && showCreateForm ? <CreateCashAccountForm /> : null}

			{hasCashAccount ? (
				<EditCashAccountForm editData={cashAccounts[0]} />
			) : null}
		</main>
	);
}
