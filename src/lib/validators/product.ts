import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(2, "SKU is required"),
  metalType: z.enum(["GOLD", "ROSE_GOLD", "WHITE_GOLD", "SILVER", "PLATINUM"]),
  purity: z.enum(["K14", "K18", "K20", "K22", "K24", "S925", "PT950"]),
  size: z.string().min(1, "Use ONE_SIZE if not size-based"),
  weightGrams: z.number().positive("Weight must be greater than 0"),
  priceAdjustment: z.number(),
  compareAtPrice: z.number().optional().nullable(),
  stockQuantity: z.number().int().min(0),
  isActive: z.boolean(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, hyphen-separated"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  brand: z.string().optional().or(z.literal("")),
  basePrice: z.number().positive("Base price must be greater than 0"),
  gstRate: z.number().min(0).max(100),
  hsnCode: z.string().optional().or(z.literal("")),
  gender: z.enum(["MEN", "WOMEN", "KIDS", "UNISEX"]),
  occasions: z.array(
    z.enum(["BRIDAL", "DAILY_WEAR", "PARTY", "FESTIVE", "OFFICE", "ENGAGEMENT", "ANNIVERSARY", "GIFTING"]),
  ),
  gemstones: z.array(
    z.enum(["DIAMOND", "RUBY", "EMERALD", "SAPPHIRE", "PEARL", "CUBIC_ZIRCONIA", "KUNDAN", "POLKI", "NONE"]),
  ),
  styleTags: z.array(
    z.enum([
      "STUD",
      "HOOP",
      "JHUMKA",
      "DROP",
      "CHANDBALI",
      "SOLITAIRE",
      "COCKTAIL",
      "BAND",
      "CHAIN",
      "PENDANT_SET",
      "BANGLE",
      "CUFF",
    ]),
  ),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  model3dUrl: z.string().optional().or(z.literal("")),
  categoryIds: z.array(z.string()).min(1, "Select at least one category"),
  primaryCategoryId: z.string().min(1, "Choose a primary category"),
  collectionIds: z.array(z.string()),
  variants: z.array(productVariantSchema).min(1, "Add at least one variant"),
}).refine((data) => data.categoryIds.includes(data.primaryCategoryId), {
  message: "Primary category must be one of the selected categories",
  path: ["primaryCategoryId"],
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
