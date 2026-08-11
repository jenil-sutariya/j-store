import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const registerWithOtpSchema = registerSchema.extend({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export type RegisterWithOtpInput = z.infer<typeof registerWithOtpSchema>;
