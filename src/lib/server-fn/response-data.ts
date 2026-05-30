/** biome-ignore-all lint/suspicious/noExplicitAny: any is fine here since we don't know the type of the data */
import type { OptionalFetcher } from "@tanstack/react-start";
import type { SuccessResponse } from "./create-success-response";

type AppServerFn<T = unknown> = OptionalFetcher<
	any,
	any,
	Promise<SuccessResponse<T>>
>;

export type AppServerFnResult<T extends AppServerFn> = NonNullable<
	Awaited<ReturnType<T>>["data"]
>;
