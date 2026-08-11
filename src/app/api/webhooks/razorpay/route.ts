import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const paymentEntity = event.payload?.payment?.entity;

  if (!paymentEntity?.order_id) {
    return NextResponse.json({ received: true });
  }

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: paymentEntity.order_id },
    include: { order: true },
  });

  if (!payment) {
    return NextResponse.json({ received: true });
  }

  if (event.event === "payment.captured") {
    if (payment.status !== "PAID") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            razorpayPaymentId: paymentEntity.id,
          },
        }),
        prisma.order.update({ where: { id: payment.orderId }, data: { status: "CONFIRMED" } }),
        prisma.orderStatusHistory.create({
          data: { orderId: payment.orderId, status: "CONFIRMED", note: "Confirmed via Razorpay webhook" },
        }),
      ]);
    }
  } else if (event.event === "payment.failed") {
    if (payment.status !== "PAID") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          failureReason: paymentEntity.error_description ?? "Payment failed",
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
