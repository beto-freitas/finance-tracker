import { Button } from "#/components/ui/button";

interface AppErrorStateProps {
	error: unknown;
	onRetry: () => void;
	onGoDashboard?: () => void;
}

function getErrorMessage(error: unknown) {
	if (!import.meta.env.DEV) {
		return "We couldn't load this section right now. Please try again.";
	}

	if (error instanceof Error) {
		return error.message;
	}

	return "An unexpected error occurred while loading this page.";
}

export function AppErrorState({
	error,
	onRetry,
	onGoDashboard,
}: AppErrorStateProps) {
	return (
		<div className="flex min-h-[70vh] items-center justify-center p-6">
			<div className="w-full max-w-xl rounded-2xl border border-primary/20 bg-background p-6 shadow-sm">
				<div className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
					App area
				</div>
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					We hit a problem in this page
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					{getErrorMessage(error)}
				</p>
				<div className="mt-6 flex flex-wrap gap-2">
					<Button type="button" onClick={onRetry}>
						Retry
					</Button>
					{onGoDashboard ? (
						<Button type="button" variant="outline" onClick={onGoDashboard}>
							Go to dashboard
						</Button>
					) : null}
				</div>
			</div>
		</div>
	);
}
