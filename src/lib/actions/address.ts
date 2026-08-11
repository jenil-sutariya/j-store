"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { addressSchema } from "@/lib/validators/address";
import type { ActionResult } from "@/lib/actions/category";

export async function createAddress(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Sign in required." };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  try {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    await prisma.address.create({
      data: { ...data, line2: data.line2 || null, landmark: data.landmark || null, userId: session.user.id },
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to save address." };
  }

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function updateAddress(id: string, input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Sign in required." };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  try {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return { success: false, error: "Address not found." };
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    await prisma.address.update({
      where: { id },
      data: { ...data, line2: data.line2 || null, landmark: data.landmark || null },
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update address." };
  }

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Sign in required." };

  try {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return { success: false, error: "Address not found." };
    }

    const usedInOrders = await prisma.order.count({
      where: { OR: [{ shippingAddressId: id }, { billingAddressId: id }] },
    });
    if (usedInOrders > 0) {
      return { success: false, error: "Cannot delete an address used in past orders." };
    }

    await prisma.address.delete({ where: { id } });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete address." };
  }

  revalidatePath("/account/addresses");
  return { success: true };
}
