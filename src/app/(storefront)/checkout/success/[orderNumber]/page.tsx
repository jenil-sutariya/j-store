import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const session = await requireUser("/account/orders");

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, payment: true, shippingAddress: true },
  });

  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  const isPending = order.status === "PENDING_PAYMENT";

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">
        {isPending ? "Payment pending" : "Thank you for your order!"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Order <span className="font-mono">{order.orderNumber}</span>{" "}
        {isPending ? "is awaiting payment confirmation." : "has been placed successfully."}
      </p>

      <div className="mt-8 space-y-2 rounded-md border p-6 text-left">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.productNameSnapshot} × {item.quantity}
            </span>
            <span>{formatINR(Number(item.lineTotal))}</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-2 font-semibold">
          <span>Total</span>
          <span>{formatINR(Number(order.grandTotal))}</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Delivering to {order.shippingAddress.fullName}, {order.shippingAddress.city}
      </p>

      <Button className="mt-8" render={<Link href="/account/orders" />}>
        View your orders
      </Button>
    </div>
  );
}
