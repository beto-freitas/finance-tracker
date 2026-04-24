import { Button } from "#/components/ui/button";

interface GlobalErrorStateProps {
	error: unknown;
	onRetry: () => void;
	onNavigateAway: () => void;
	navigateAwayLabel: string;
}

function getErrorMessage(error: unknown) {
	if (!import.meta.env.DEV) {
		return "The application couldn't complete this request. You can retry or continue to another page.";
	}

	if (error instanceof Error) {
		return error.message;
	}

	return "An unexpected application error occurred.";
}

export function GlobalErrorState({
	error,
	onRetry,
	onNavigateAway,
	navigateAwayLabel,
}: GlobalErrorStateProps) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-6">
			<div className="w-full max-w-xl rounded-2xl border border-primary/20 bg-background p-6 shadow-sm">
				<div className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
					Application error
				</div>
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					Something went wrong
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					{getErrorMessage(error)}
				</p>
				<div className="mt-6 flex flex-wrap gap-2">
					<Button type="button" onClick={onRetry}>
						Retry
					</Button>
					<Button type="button" variant="outline" onClick={onNavigateAway}>
						{navigateAwayLabel}
					</Button>
				</div>
			</div>
		</div>
	);
}
