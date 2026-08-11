import { z } from "zod";

export const addressSchema = z.object({
  type: z.enum(["SHIPPING", "BILLING"]),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  line1: z.string().min(3, "Address line is required"),
  line2: z.string().optional().or(z.literal("")),
  landmark: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(4, "Enter a valid postal code"),
  isDefault: z.boolean(),
});

export type AddressInput = z.infer<typeof addressSchema>;
