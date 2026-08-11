import { z } from "zod";

export const couponSchema = z
  .object({
    code: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .regex(/^[A-Z0-9_-]+$/, "Use uppercase letters, numbers, hyphens, underscores"),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    value: z.number().positive("Value must be greater than 0"),
    minOrderValue: z.number().min(0).optional().nullable(),
    maxDiscountAmount: z.number().min(0).optional().nullable(),
    usageLimit: z.number().int().min(1).optional().nullable(),
    usageLimitPerUser: z.number().int().min(1),
    validFrom: z.string().min(1, "Start date is required"),
    validUntil: z.string().min(1, "End date is required"),
    isActive: z.boolean(),
  })
  .refine((data) => new Date(data.validUntil) > new Date(data.validFrom), {
    message: "End date must be after start date",
    path: ["validUntil"],
  })
  .refine((data) => data.type !== "PERCENTAGE" || data.value <= 100, {
    message: "Percentage value cannot exceed 100",
    path: ["value"],
  });

export type CouponInput = z.infer<typeof couponSchema>;
