"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/lib/actions/category";

export async function toggleWishlist(productId: string): Promise<ActionResult & { wishlisted?: boolean }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Sign in to save items to your wishlist." };
  }

  try {
    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      revalidatePath("/wishlist");
      return { success: true, wishlisted: false };
    }

    await prisma.wishlistItem.create({
      data: { userId: session.user.id, productId },
    });
    revalidatePath("/wishlist");
    return { success: true, wishlisted: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update wishlist." };
  }
}
