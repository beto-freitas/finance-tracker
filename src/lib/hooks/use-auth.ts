import { useSuspenseQuery } from "@tanstack/react-query";
import { sessionQueryOptions } from "#/features/auth/queries/session-query-options";

export function useAuth() {
	const { data } = useSuspenseQuery(sessionQueryOptions());

	return data as Exclude<typeof data, null>;
}
