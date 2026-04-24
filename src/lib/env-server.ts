import { z } from "zod";

const envServerSchema = z.object({
	TURSO_DATABASE_URL: z.string().startsWith("libsql://"),
	TURSO_AUTH_TOKEN: z.string().min(1),
	BETTER_AUTH_SECRET: z.string().min(32),
	BETTER_AUTH_URL: z.url(),
});

export type EnvServer = z.infer<typeof envServerSchema>;

export const envServer: EnvServer = envServerSchema.parse(process.env);
