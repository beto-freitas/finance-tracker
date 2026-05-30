import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { authServer } from "#/lib/auth/auth-server";

export const getAuthSessionServerFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const headers = getRequestHeaders();
		return await authServer.api.getSession({ headers });
	},
);
