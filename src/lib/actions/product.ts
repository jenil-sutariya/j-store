"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/require-admin";
import { productSchema } from "@/lib/validators/product";
import type { ActionResult } from "@/lib/actions/category";

export async function saveProduct(
  id: string | undefined,
  input: unknown,
): Promise<ActionResult & { productId?: string }> {
  await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  let productId: string;

  try {
    const existingSlug = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existingSlug && existingSlug.id !== id) {
      return { success: false, error: "A product with this slug already exists." };
    }

    productId = await prisma.$transaction(async (tx) => {
      const product = await tx.product.upsert({
        where: { id: id ?? "__new__" },
        update: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          brand: data.brand || null,
          basePrice: data.basePrice,
          gstRate: data.gstRate,
          hsnCode: data.hsnCode || null,
          gender: data.gender,
          occasions: data.occasions,
          gemstones: data.gemstones,
          styleTags: data.styleTags,
          isPublished: data.isPublished,
          isFeatured: data.isFeatured,
          model3dUrl: data.model3dUrl || null,
        },
        create: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          brand: data.brand || null,
          basePrice: data.basePrice,
          gstRate: data.gstRate,
          hsnCode: data.hsnCode || null,
          gender: data.gender,
          occasions: data.occasions,
          gemstones: data.gemstones,
          styleTags: data.styleTags,
          isPublished: data.isPublished,
          isFeatured: data.isFeatured,
          model3dUrl: data.model3dUrl || null,
        },
      });

      // Categories: replace membership entirely, preserving isPrimary flag.
      await tx.productCategory.deleteMany({ where: { productId: product.id } });
      await tx.productCategory.createMany({
        data: data.categoryIds.map((categoryId) => ({
          productId: product.id,
          categoryId,
          isPrimary: categoryId === data.primaryCategoryId,
        })),
      });

      // Collections: replace membership entirely (sort order appended at the end).
      const existingCollectionLinks = await tx.productCollection.findMany({
        where: { productId: product.id },
      });
      const existingCollectionIds = new Set(existingCollectionLinks.map((l) => l.collectionId));
      const nextCollectionIds = new Set(data.collectionIds);

      await tx.productCollection.deleteMany({
        where: {
          productId: product.id,
          collectionId: { notIn: data.collectionIds },
        },
      });
      const toAdd = [...nextCollectionIds].filter((cid) => !existingCollectionIds.has(cid));
      if (toAdd.length > 0) {
        await tx.productCollection.createMany({
          data: toAdd.map((collectionId) => ({ productId: product.id, collectionId })),
        });
      }

      // Variants: update existing (by id), create new (no id), soft-delete removed ones.
      const existingVariants = await tx.productVariant.findMany({
        where: { productId: product.id },
        select: { id: true },
      });
      const incomingIds = new Set(data.variants.map((v) => v.id).filter(Boolean));

      for (const variant of existingVariants) {
        if (!incomingIds.has(variant.id)) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { isActive: false },
          });
        }
      }

      for (const variant of data.variants) {
        const price = data.basePrice + variant.priceAdjustment;
        if (variant.id) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              sku: variant.sku,
              metalType: variant.metalType,
              purity: variant.purity,
              size: variant.size,
              weightGrams: variant.weightGrams,
              priceAdjustment: variant.priceAdjustment,
              price,
              compareAtPrice: variant.compareAtPrice ?? null,
              stockQuantity: variant.stockQuantity,
              isActive: variant.isActive,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: product.id,
              sku: variant.sku,
              metalType: variant.metalType,
              purity: variant.purity,
              size: variant.size,
              weightGrams: variant.weightGrams,
              priceAdjustment: variant.priceAdjustment,
              price,
              compareAtPrice: variant.compareAtPrice ?? null,
              stockQuantity: variant.stockQuantity,
              isActive: variant.isActive,
            },
          });
        }
      }

      return product.id;
    });
  } catch (error) {
    console.error(error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      (error.meta?.target as string[] | undefined)?.includes("sku")
    ) {
      return {
        success: false,
        error: "That SKU is already used by another variant. Each variant needs a unique SKU.",
      };
    }
    return { success: false, error: "Failed to save product." };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);

  if (!id) {
    redirect(`/admin/products/${productId}`);
  }

  return { success: true, productId };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const orderItemCount = await prisma.orderItem.count({ where: { variant: { productId: id } } });
    if (orderItemCount > 0) {
      return { success: false, error: "Cannot delete a product that has order history." };
    }

    await prisma.product.delete({ where: { id } });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete product." };
  }

  revalidatePath("/admin/products");
  return { success: true };
}
