import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, hyphen-separated"),
  description: z.string().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imagePublicId: z.string().optional().or(z.literal("")),
  parentId: z.string().optional().or(z.literal("")),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
