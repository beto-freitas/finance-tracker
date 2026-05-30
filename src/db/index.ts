import { drizzle } from "drizzle-orm/libsql";
import { envServer } from "#/lib/env/env-server";
import { relations } from "./relations";
import * as schemas from "./schemas";

export const db = drizzle({
	connection: {
		url: envServer.TURSO_DATABASE_URL,
		authToken: envServer.TURSO_AUTH_TOKEN,
	},
	schema: schemas,
	relations,
});
