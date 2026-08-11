"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { collectionSchema } from "@/lib/validators/collection";
import type { ActionResult } from "@/lib/actions/category";

function parseDate(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createCollection(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = collectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  try {
    const existing = await prisma.collection.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return { success: false, error: "A collection with this slug already exists." };
    }

    await prisma.collection.create({
      data: {
        name: data.name,
        slug: data.slug,
        tagline: data.tagline || null,
        storyContent: data.storyContent || null,
        bannerUrl: data.bannerUrl || null,
        bannerPublicId: data.bannerPublicId || null,
        startsAt: parseDate(data.startsAt),
        endsAt: parseDate(data.endsAt),
        isFeatured: data.isFeatured,
        isActive: data.isActive,
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create collection." };
  }

  revalidatePath("/admin/collections");
  redirect("/admin/collections");
}

export async function updateCollection(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = collectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  try {
    const existing = await prisma.collection.findUnique({ where: { slug: data.slug } });
    if (existing && existing.id !== id) {
      return { success: false, error: "A collection with this slug already exists." };
    }

    await prisma.collection.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        tagline: data.tagline || null,
        storyContent: data.storyContent || null,
        bannerUrl: data.bannerUrl || null,
        bannerPublicId: data.bannerPublicId || null,
        startsAt: parseDate(data.startsAt),
        endsAt: parseDate(data.endsAt),
        isFeatured: data.isFeatured,
        isActive: data.isActive,
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update collection." };
  }

  revalidatePath("/admin/collections");
  revalidatePath(`/admin/collections/${id}`);
  return { success: true };
}

export async function deleteCollection(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.collection.delete({ where: { id } });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete collection." };
  }

  revalidatePath("/admin/collections");
  return { success: true };
}

export async function addProductToCollection(
  collectionId: string,
  productId: string,
): Promise<ActionResult> {
  await requireAdmin();

  try {
    const maxSortOrder = await prisma.productCollection.aggregate({
      where: { collectionId },
      _max: { sortOrder: true },
    });

    await prisma.productCollection.upsert({
      where: { productId_collectionId: { productId, collectionId } },
      update: {},
      create: {
        productId,
        collectionId,
        sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to add product to collection." };
  }

  revalidatePath(`/admin/collections/${collectionId}`);
  return { success: true };
}

export async function removeProductFromCollection(
  collectionId: string,
  productId: string,
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await prisma.productCollection.delete({
      where: { productId_collectionId: { productId, collectionId } },
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to remove product from collection." };
  }

  revalidatePath(`/admin/collections/${collectionId}`);
  return { success: true };
}
