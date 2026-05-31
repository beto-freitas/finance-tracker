import type { MutationOptions } from "@tanstack/react-query";

export type MutationOnSuccessArgs = Parameters<
	NonNullable<MutationOptions<unknown, unknown, unknown, unknown>["onSuccess"]>
>;

export const queryClientOnSuccess = (args: MutationOnSuccessArgs) => {
	const { client: queryClient } = args[3];
	if (!queryClient) {
		throw new Error("Query client not found on mutation on success args");
	}

	return queryClient;
};
