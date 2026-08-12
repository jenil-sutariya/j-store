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
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <p className="mb-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">Account</p>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl break-words sm:text-3xl">{order.orderNumber}</h1>
        <Badge variant="secondary">{order.status.replace(/_/g, " ")}</Badge>
      </div>

      <div className="space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="space-y-2 border-b border-border pb-4 last:border-b-0">
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm">
              <span className="break-words">
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
        <p className="break-words text-muted-foreground">
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
