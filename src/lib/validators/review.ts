import { z } from "zod";

export const reviewSchema = z.object({
  orderItemId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional().or(z.literal("")),
  comment: z.string().optional().or(z.literal("")),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
