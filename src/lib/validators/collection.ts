import { z } from "zod";

export const collectionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, hyphen-separated"),
  tagline: z.string().optional().or(z.literal("")),
  storyContent: z.string().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  bannerPublicId: z.string().optional().or(z.literal("")),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

export type CollectionInput = z.infer<typeof collectionSchema>;
