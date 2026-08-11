import { prisma } from "@/lib/prisma";

export async function validateCoupon(code: string, userId: string, subtotal: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.isActive) {
    return { valid: false as const, error: "Invalid coupon code." };
  }

  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) {
    return { valid: false as const, error: "This coupon has expired." };
  }

  if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
    return {
      valid: false as const,
      error: `Minimum order value of ₹${coupon.minOrderValue} required.`,
    };
  }

  if (coupon.usageLimit) {
    const totalRedemptions = await prisma.couponRedemption.count({ where: { couponId: coupon.id } });
    if (totalRedemptions >= coupon.usageLimit) {
      return { valid: false as const, error: "This coupon has reached its usage limit." };
    }
  }

  if (coupon.usageLimitPerUser) {
    const userRedemptions = await prisma.couponRedemption.count({
      where: { couponId: coupon.id, userId },
    });
    if (userRedemptions >= coupon.usageLimitPerUser) {
      return { valid: false as const, error: "You've already used this coupon." };
    }
  }

  let discount =
    coupon.type === "PERCENTAGE" ? (subtotal * Number(coupon.value)) / 100 : Number(coupon.value);

  if (coupon.maxDiscountAmount) {
    discount = Math.min(discount, Number(coupon.maxDiscountAmount));
  }
  discount = Math.min(discount, subtotal);

  return { valid: true as const, coupon, discount };
}
