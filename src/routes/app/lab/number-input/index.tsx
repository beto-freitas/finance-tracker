import { createFileRoute, Link } from "@tanstack/react-router";

import { NumberInputLabForm } from "#/routes/app/lab/number-input/-lib/number-input-lab-form.tsx";

export const Route = createFileRoute("/app/lab/number-input/")({
	component: NumberInputLabPage,
});

function NumberInputLabPage() {
	return (
		<main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
			<div className="flex flex-col gap-2">
				<Link
					to="/app/dashboard"
					className="text-muted-foreground text-sm hover:text-foreground"
				>
					← Dashboard
				</Link>
				<h1 className="font-semibold text-2xl">NumberInput lab</h1>
				<p className="text-muted-foreground text-sm">
					Each row compares a TextInput (left) with a NumberInput (right) using
					the same addons. Live form values are shown below; use the action
					buttons to test reset and external setFieldValue.
				</p>
			</div>

			<NumberInputLabForm />
		</main>
	);
}
