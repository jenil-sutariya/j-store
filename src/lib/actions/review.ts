"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/require-admin";
import { reviewSchema } from "@/lib/validators/review";
import type { ActionResult } from "@/lib/actions/category";

async function recomputeProductRating(productId: string) {
  const result = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      ratingAvg: result._avg.rating ?? 0,
      ratingCount: result._count.rating,
    },
  });
}

export async function createReview(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Sign in required." };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  try {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: data.orderItemId },
      include: { order: true, variant: true },
    });

    if (!orderItem || orderItem.order.userId !== session.user.id) {
      return { success: false, error: "Order item not found." };
    }
    if (orderItem.order.status !== "DELIVERED") {
      return { success: false, error: "You can only review delivered items." };
    }

    const productId = orderItem.variant.productId;

    const existing = await prisma.review.findUnique({
      where: { productId_userId: { productId, userId: session.user.id } },
    });
    if (existing) {
      return { success: false, error: "You've already reviewed this product." };
    }

    await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        orderItemId: data.orderItemId,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment || null,
        isVerifiedPurchase: true,
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to submit review." };
  }

  revalidatePath("/account/orders");
  return { success: true };
}

export async function approveReview(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const review = await prisma.review.update({ where: { id }, data: { isApproved: true } });
    await recomputeProductRating(review.productId);
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to approve review." };
  }

  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function rejectReview(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return { success: false, error: "Review not found." };

    await prisma.review.delete({ where: { id } });
    if (review.isApproved) {
      await recomputeProductRating(review.productId);
    }
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to reject review." };
  }

  revalidatePath("/admin/reviews");
  return { success: true };
}
