import { z } from "zod";

const envClientSchema = z.object({});

export type EnvClient = z.infer<typeof envClientSchema>;

export const envClient: EnvClient = envClientSchema.parse(import.meta.env);
