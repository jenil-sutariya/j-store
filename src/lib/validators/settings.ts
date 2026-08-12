import { z } from "zod";

export const settingsSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  tagline: z.string().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  logoPublicId: z.string().optional().or(z.literal("")),
  legalEntityName: z.string().optional().or(z.literal("")),
  gstin: z.string().optional().or(z.literal("")),
  registeredAddress: z.string().optional().or(z.literal("")),
  supportEmail: z.string().email().optional().or(z.literal("")),
  supportPhone: z.string().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  shippingFlatFee: z.number().min(0, "Must be 0 or greater"),
  freeShippingThreshold: z.number().min(0, "Must be 0 or greater"),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
