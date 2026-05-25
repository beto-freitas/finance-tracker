import { z } from "zod";

export const signupFormSchema = z.object({
	name: z.string().min(1, "Enter your name"),
	email: z.email("Enter a valid email"),
	password: z.string().min(8, "Use at least 8 characters"),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;
