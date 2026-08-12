import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/storefront/reveal";

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
    <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6 sm:py-20 lg:px-8">
      <Reveal>
        <div
          className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
            isPending ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
          }`}
        >
          <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
        </div>

        <p className="mb-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">Aurelia</p>
        <h1 className="font-display text-3xl sm:text-4xl">
          {isPending ? "Payment pending" : "Thank you for your order"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Order <span className="font-mono break-words">{order.orderNumber}</span>{" "}
          {isPending ? "is awaiting payment confirmation." : "has been placed successfully."}
        </p>

        <div className="mt-10 space-y-3 border border-border bg-card p-6 text-left sm:p-8">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-4 text-sm">
              <span className="break-words">
                {item.productNameSnapshot} × {item.quantity}
              </span>
              <span className="shrink-0">{formatINR(Number(item.lineTotal))}</span>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-border pt-3 font-semibold">
            <span>Total</span>
            <span>{formatINR(Number(order.grandTotal))}</span>
          </div>
        </div>

        <p className="mt-5 text-sm break-words text-muted-foreground">
          Delivering to {order.shippingAddress.fullName}, {order.shippingAddress.city}
        </p>

        <Button size="lg" className="mt-8" render={<Link href="/account/orders" />}>
          View your orders
        </Button>
      </Reveal>
    </div>
  );
}
