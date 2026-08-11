"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/lib/actions/category";

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function addToCart(variantId: string, quantity = 1): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Sign in to add items to your bag." };
  }

  try {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant || !variant.isActive) {
      return { success: false, error: "This item is not available." };
    }
    if (variant.stockQuantity < quantity) {
      return { success: false, error: "Not enough stock available." };
    }

    const cart = await getOrCreateCart(session.user.id);

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });

    if (existingItem) {
      const nextQuantity = existingItem.quantity + quantity;
      if (nextQuantity > variant.stockQuantity) {
        return { success: false, error: "Not enough stock available." };
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: nextQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, variantId, quantity, priceAtAdd: variant.price },
      });
    }
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to add item to bag." };
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Sign in required." };
  }

  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, variant: true },
    });
    if (!item || item.cart.userId !== session.user.id) {
      return { success: false, error: "Item not found." };
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
    } else {
      if (quantity > item.variant.stockQuantity) {
        return { success: false, error: "Not enough stock available." };
      }
      await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
    }
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update quantity." };
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function removeCartItem(cartItemId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Sign in required." };
  }

  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });
    if (!item || item.cart.userId !== session.user.id) {
      return { success: false, error: "Item not found." };
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to remove item." };
  }

  revalidatePath("/cart");
  return { success: true };
}
