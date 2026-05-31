import type { QueryKey } from "@tanstack/react-query";
import {
	type MutationOnSuccessArgs,
	queryClientOnSuccess,
} from "./query-client-on-success";

export async function invalidateOnSuccess(
	args: MutationOnSuccessArgs,
	queryKey: QueryKey,
) {
	const queryClient = queryClientOnSuccess(args);

	await queryClient.invalidateQueries({ queryKey });
}
