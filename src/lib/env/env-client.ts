import z from "zod";

const envClientSchema = z.object({
	BETTER_AUTH_URL: z.string(),
});

export type EnvClient = z.infer<typeof envClientSchema>;
export const envClient = envClientSchema.parse(import.meta.env);
