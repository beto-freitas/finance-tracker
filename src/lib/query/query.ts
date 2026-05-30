import { QueryClient } from "@tanstack/react-query";

export function getContext() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 3 * 60 * 1000, // 3 minutes
			},
		},
	});

	return {
		queryClient,
	};
}
