"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { siteContentSchema } from "@/lib/validators/content";
import type { ActionResult } from "@/lib/actions/category";

export async function updateSiteContent(key: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = siteContentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  try {
    await prisma.siteContent.update({
      where: { key },
      data: {
        title: data.title || null,
        tagline: data.tagline || null,
        body: data.body || null,
        imageUrl: data.imageUrl || null,
        imagePublicId: data.imagePublicId || null,
        linkLabel: data.linkLabel || null,
        linkHref: data.linkHref || null,
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update content." };
  }

  revalidatePath("/admin/content");
  revalidatePath("/", "layout");
  return { success: true };
}
