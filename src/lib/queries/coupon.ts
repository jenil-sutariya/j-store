import { prisma } from "@/lib/prisma";

export async function getAllCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
  });
}

export async function getCouponById(id: string) {
  return prisma.coupon.findUnique({ where: { id } });
}
