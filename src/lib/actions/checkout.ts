"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validateCoupon } from "@/lib/coupon";
import { createRazorpayOrder, verifyPaymentSignature } from "@/lib/razorpay";
import { getStoreSettings } from "@/lib/queries/settings";

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `JW-${year}-${random}`;
}

type PlaceOrderInput = {
  addressId: string;
  couponCode?: string;
  paymentMethod: "COD" | "RAZORPAY";
};

type PlaceOrderResult =
  | { success: false; error: string }
  | { success: true; orderNumber: string; paymentMethod: "COD" }
  | {
      success: true;
      orderNumber: string;
      paymentMethod: "RAZORPAY";
      razorpayOrderId: string;
      amount: number;
      keyId: string;
    };

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Sign in required." };
  }
  const userId = session.user.id;

  const address = await prisma.address.findUnique({ where: { id: input.addressId } });
  if (!address || address.userId !== userId) {
    return { success: false, error: "Select a valid delivery address." };
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { variant: { include: { product: true } } },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return { success: false, error: "Your bag is empty." };
  }

  for (const item of cart.items) {
    if (!item.variant.isActive || item.variant.stockQuantity < item.quantity) {
      return {
        success: false,
        error: `${item.variant.product.name} no longer has enough stock. Please update your bag.`,
      };
    }
  }

  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);

  let discountTotal = 0;
  let appliedCouponId: string | null = null;
  if (input.couponCode) {
    const result = await validateCoupon(input.couponCode, userId, subtotal);
    if (!result.valid) {
      return { success: false, error: result.error };
    }
    discountTotal = result.discount;
    appliedCouponId = result.coupon.id;
  }

  const gstTotal = cart.items.reduce((sum, item) => {
    const lineTotal = Number(item.variant.price) * item.quantity;
    const gstRate = Number(item.variant.product.gstRate);
    const taxable = lineTotal / (1 + gstRate / 100);
    return sum + (lineTotal - taxable);
  }, 0);

  const settings = await getStoreSettings();
  const shippingTotal =
    subtotal - discountTotal >= settings.freeShippingThreshold ? 0 : settings.shippingFlatFee;
  const grandTotal = subtotal - discountTotal + shippingTotal;

  const orderNumber = generateOrderNumber();
  const status = input.paymentMethod === "COD" ? "CONFIRMED" : "PENDING_PAYMENT";

  let createdOrderId: string;

  try {
    createdOrderId = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status,
          paymentMethod: input.paymentMethod,
          subtotal,
          discountTotal,
          gstTotal,
          shippingTotal,
          grandTotal,
          couponId: appliedCouponId,
          shippingAddressId: address.id,
          billingAddressId: address.id,
          items: {
            create: cart.items.map((item) => ({
              variantId: item.variantId,
              productNameSnapshot: item.variant.product.name,
              skuSnapshot: item.variant.sku,
              quantity: item.quantity,
              unitPrice: item.variant.price,
              gstRateSnapshot: item.variant.product.gstRate,
              lineTotal: Number(item.variant.price) * item.quantity,
            })),
          },
          statusHistory: {
            create: { status },
          },
          payment: {
            create: {
              method: input.paymentMethod,
              status: "PENDING",
              amount: grandTotal,
            },
          },
        },
      });

      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      if (appliedCouponId) {
        await tx.couponRedemption.create({
          data: { couponId: appliedCouponId, userId, orderId: order.id },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order.id;
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to place order. Please try again." };
  }

  revalidatePath("/cart");

  if (input.paymentMethod === "COD") {
    return { success: true, orderNumber, paymentMethod: "COD" };
  }

  try {
    const razorpayOrder = await createRazorpayOrder(grandTotal, orderNumber);

    await prisma.payment.update({
      where: { orderId: createdOrderId },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    return {
      success: true,
      orderNumber,
      paymentMethod: "RAZORPAY",
      razorpayOrderId: razorpayOrder.id,
      amount: Math.round(grandTotal * 100),
      keyId: process.env.RAZORPAY_KEY_ID as string,
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Order created, but payment could not be initiated. Contact support." };
  }
}

export async function previewCoupon(
  code: string,
  subtotal: number,
): Promise<{ valid: boolean; discount?: number; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { valid: false, error: "Sign in required." };
  }

  const result = await validateCoupon(code, session.user.id, subtotal);
  if (!result.valid) {
    return { valid: false, error: result.error };
  }
  return { valid: true, discount: result.discount };
}

export async function verifyRazorpayPayment(input: {
  orderNumber: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Sign in required." };
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: input.orderNumber },
    include: { payment: true },
  });

  if (!order || order.userId !== session.user.id || !order.payment?.razorpayOrderId) {
    return { success: false, error: "Order not found." };
  }

  if (order.payment.status === "PAID") {
    return { success: true };
  }

  const isValid = verifyPaymentSignature({
    orderId: order.payment.razorpayOrderId,
    paymentId: input.razorpayPaymentId,
    signature: input.razorpaySignature,
  });

  if (!isValid) {
    return { success: false, error: "Payment verification failed." };
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId: order.id },
      data: {
        status: "PAID",
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.razorpaySignature,
      },
    }),
    prisma.order.update({ where: { id: order.id }, data: { status: "CONFIRMED" } }),
    prisma.orderStatusHistory.create({ data: { orderId: order.id, status: "CONFIRMED" } }),
  ]);

  return { success: true };
}
