"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { couponSchema } from "@/lib/validators/coupon";
import type { ActionResult } from "@/lib/actions/category";

export async function createCoupon(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  try {
    const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existing) {
      return { success: false, error: "A coupon with this code already exists." };
    }

    await prisma.coupon.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minOrderValue: data.minOrderValue ?? null,
        maxDiscountAmount: data.maxDiscountAmount ?? null,
        usageLimit: data.usageLimit ?? null,
        usageLimitPerUser: data.usageLimitPerUser,
        validFrom: new Date(data.validFrom),
        validUntil: new Date(data.validUntil),
        isActive: data.isActive,
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create coupon." };
  }

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function updateCoupon(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  try {
    const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existing && existing.id !== id) {
      return { success: false, error: "A coupon with this code already exists." };
    }

    await prisma.coupon.update({
      where: { id },
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minOrderValue: data.minOrderValue ?? null,
        maxDiscountAmount: data.maxDiscountAmount ?? null,
        usageLimit: data.usageLimit ?? null,
        usageLimitPerUser: data.usageLimitPerUser,
        validFrom: new Date(data.validFrom),
        validUntil: new Date(data.validUntil),
        isActive: data.isActive,
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update coupon." };
  }

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function deleteCoupon(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const redemptionCount = await prisma.couponRedemption.count({ where: { couponId: id } });
    if (redemptionCount > 0) {
      return { success: false, error: "Cannot delete a coupon that has been redeemed." };
    }

    await prisma.coupon.delete({ where: { id } });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete coupon." };
  }

  revalidatePath("/admin/coupons");
  return { success: true };
}
