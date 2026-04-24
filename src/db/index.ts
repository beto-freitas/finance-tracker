import { drizzle } from "drizzle-orm/libsql";
import { envServer } from "#/lib/env-server";
import * as schema from "./schema";

export const db = drizzle({
	connection: {
		url: envServer.TURSO_DATABASE_URL,
		authToken: envServer.TURSO_AUTH_TOKEN,
	},
	schema,
	casing: "snake_case",
});
