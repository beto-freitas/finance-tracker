import type { MutationOptions, QueryKey } from "@tanstack/react-query";

export async function invalidateOnSuccess(
	args: Parameters<
		NonNullable<
			MutationOptions<unknown, unknown, unknown, unknown>["onSuccess"]
		>
	>,
	queryKey: QueryKey,
) {
	await args[3].client.invalidateQueries({ queryKey });
}
