"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import type { ActionResult } from "@/lib/actions/category";

export async function addProductImage(
  productId: string,
  variantId: string | null,
  image: { url: string; publicId: string; altText?: string },
): Promise<ActionResult> {
  await requireAdmin();

  try {
    const maxSortOrder = await prisma.productImage.aggregate({
      where: { productId, variantId },
      _max: { sortOrder: true },
    });

    await prisma.productImage.create({
      data: {
        productId,
        variantId,
        cloudinaryPublicId: image.publicId,
        url: image.url,
        altText: image.altText ?? null,
        sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to add image." };
  }

  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function updateProductImageAltText(
  imageId: string,
  altText: string,
): Promise<ActionResult> {
  await requireAdmin();

  try {
    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) {
      return { success: false, error: "Image not found." };
    }

    await prisma.productImage.update({
      where: { id: imageId },
      data: { altText: altText || null },
    });

    revalidatePath(`/admin/products/${image.productId}`);
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update alt text." };
  }

  return { success: true };
}

export async function deleteProductImage(imageId: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) {
      return { success: false, error: "Image not found." };
    }

    await prisma.productImage.delete({ where: { id: imageId } });

    if (image.cloudinaryPublicId.startsWith("seed/")) {
      // Seed placeholder images have no real Cloudinary asset to clean up.
    } else {
      await deleteCloudinaryAsset(image.cloudinaryPublicId).catch(() => null);
    }

    revalidatePath(`/admin/products/${image.productId}`);
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete image." };
  }

  return { success: true };
}
