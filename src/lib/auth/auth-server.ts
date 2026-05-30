// server-only module
import "@tanstack/react-start/server";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "#/db";
import * as schemas from "#/db/schemas";

export const authServer = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: schemas,
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [tanstackStartCookies()],
});
