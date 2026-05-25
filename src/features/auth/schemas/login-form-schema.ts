import { z } from "zod";

export const loginFormSchema = z.object({
	email: z.email("Enter a valid email"),
	password: z.string().min(1, "Enter your password"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
