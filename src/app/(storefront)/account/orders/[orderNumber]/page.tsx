import { notFound } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReviewForm } from "@/components/storefront/review-form";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const session = await requireUser("/account/orders");

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { include: { variant: { select: { productId: true } } } },
      payment: true,
      shippingAddress: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  const existingReviews =
    order.status === "DELIVERED"
      ? await prisma.review.findMany({
          where: {
            userId: session.user.id,
            productId: { in: order.items.map((item) => item.variant.productId) },
          },
          select: { productId: true },
        })
      : [];
  const reviewedProductIds = new Set(existingReviews.map((r) => r.productId));

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold font-mono">{order.orderNumber}</h1>
        <Badge variant="secondary">{order.status.replace(/_/g, " ")}</Badge>
      </div>

      <div className="space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {item.productNameSnapshot} × {item.quantity}
              </span>
              <span>{formatINR(Number(item.lineTotal))}</span>
            </div>
            {order.status === "DELIVERED" && !reviewedProductIds.has(item.variant.productId) && (
              <ReviewForm orderItemId={item.id} productName={item.productNameSnapshot} />
            )}
          </div>
        ))}
      </div>

      <Separator className="my-6" />

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatINR(Number(order.subtotal))}</span>
        </div>
        {Number(order.discountTotal) > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatINR(Number(order.discountTotal))}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{Number(order.shippingTotal) === 0 ? "Free" : formatINR(Number(order.shippingTotal))}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatINR(Number(order.grandTotal))}</span>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="text-sm">
        <p className="font-medium">Delivery address</p>
        <p className="text-muted-foreground">
          {order.shippingAddress.fullName}, {order.shippingAddress.line1}, {order.shippingAddress.city},{" "}
          {order.shippingAddress.state} {order.shippingAddress.postalCode}
        </p>
      </div>

      <Separator className="my-6" />

      <div className="text-sm">
        <p className="mb-2 font-medium">Order timeline</p>
        <div className="space-y-1">
          {order.statusHistory.map((entry) => (
            <p key={entry.id} className="text-muted-foreground">
              {entry.createdAt.toLocaleString()} — {entry.status.replace(/_/g, " ")}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
