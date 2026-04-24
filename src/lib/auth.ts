import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "#/db";
import { envServer } from "#/lib/env-server";

export const auth = betterAuth({
	secret: envServer.BETTER_AUTH_SECRET,
	baseURL: envServer.BETTER_AUTH_URL,
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [tanstackStartCookies()],
});
