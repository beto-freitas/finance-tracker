// server-only module
import "@tanstack/react-start/server";

import z from "zod";

const envServerSchema = z.object({
	TURSO_DATABASE_URL: z.string(),
	TURSO_AUTH_TOKEN: z.string(),
});

export type EnvServer = z.infer<typeof envServerSchema>;
export const envServer = envServerSchema.parse(process.env);
