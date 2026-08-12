import { z } from "zod";

export const siteContentSchema = z.object({
  title: z.string().optional().or(z.literal("")),
  tagline: z.string().optional().or(z.literal("")),
  body: z.string().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imagePublicId: z.string().optional().or(z.literal("")),
  linkLabel: z.string().optional().or(z.literal("")),
  linkHref: z.string().optional().or(z.literal("")),
});

export type SiteContentInput = z.infer<typeof siteContentSchema>;
