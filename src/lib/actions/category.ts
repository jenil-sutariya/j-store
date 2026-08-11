"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { categorySchema } from "@/lib/validators/category";
import { getCategoryDescendantIds } from "@/lib/queries/category";

export type ActionResult = { success: true } | { success: false; error: string };

function cleanParentId(parentId: string | undefined) {
  return parentId && parentId !== "none" ? parentId : null;
}

export async function createCategory(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  try {
    const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return { success: false, error: "A category with this slug already exists." };
    }

    await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        imagePublicId: data.imagePublicId || null,
        parentId: cleanParentId(data.parentId),
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create category." };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const parentId = cleanParentId(data.parentId);

  if (parentId === id) {
    return { success: false, error: "A category cannot be its own parent." };
  }

  if (parentId) {
    const descendants = await getCategoryDescendantIds(id);
    if (descendants.has(parentId)) {
      return { success: false, error: "Cannot move a category under its own descendant." };
    }
  }

  try {
    const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
    if (existing && existing.id !== id) {
      return { success: false, error: "A category with this slug already exists." };
    }

    await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        imagePublicId: data.imagePublicId || null,
        parentId,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update category." };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const childCount = await prisma.category.count({ where: { parentId: id } });
    if (childCount > 0) {
      return { success: false, error: "Delete or reassign sub-categories first." };
    }

    const productCount = await prisma.productCategory.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return { success: false, error: "Remove this category from all products first." };
    }

    await prisma.category.delete({ where: { id } });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete category." };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}
