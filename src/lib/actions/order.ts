"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import type { OrderStatus } from "@/generated/prisma/enums";
import type { ActionResult } from "@/lib/actions/category";

const STOCK_RESTORING_STATUSES: OrderStatus[] = ["CANCELLED", "RETURNED"];

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string,
): Promise<ActionResult> {
  await requireAdmin();

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) return { success: false, error: "Order not found." };

    const shouldRestoreStock =
      STOCK_RESTORING_STATUSES.includes(status) && !STOCK_RESTORING_STATUSES.includes(order.status);

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status } });
      await tx.orderStatusHistory.create({ data: { orderId, status, note: note || null } });

      if (shouldRestoreStock) {
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        }
      }
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update order status." };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function markCodPaymentCollected(orderId: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
    if (!order || order.paymentMethod !== "COD" || !order.payment) {
      return { success: false, error: "Not a valid COD order." };
    }

    await prisma.payment.update({ where: { id: order.payment.id }, data: { status: "PAID" } });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update payment." };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}
