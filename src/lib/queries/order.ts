import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/enums";

export async function getAllOrders(status?: OrderStatus) {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { placedAt: "desc" },
    include: { user: { select: { name: true, email: true } }, items: true, payment: true },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: true,
      payment: true,
      shippingAddress: true,
      billingAddress: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      coupon: true,
    },
  });
}
